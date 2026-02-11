import { GraphQLClient } from 'graphql-request';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

Object.assign(process.env, envVars);

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !token) {
  console.error('Missing environment variables. Make sure .env.local has:');
  console.error('- NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN');
  console.error('- NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  process.exit(1);
}

const client = new GraphQLClient(`https://${domain}/api/2024-01/graphql.json`, {
  headers: {
    'X-Shopify-Storefront-Access-Token': token,
  },
});

const query = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      variants(first: 20) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
    }
  }
`;

const handle = process.argv[2] || 'devil-fruit-collection-unisex-hoodie';

try {
  const data = await client.request(query, { handle });

  if (!data.product) {
    console.error(`Product not found: ${handle}`);
    process.exit(1);
  }

  console.log(`\nProduct: ${data.product.title}\n`);
  console.log('Variants:');
  console.log('─'.repeat(80));

  data.product.variants.edges.forEach(({ node }, index) => {
    console.log(`${index + 1}. ${node.title}`);
    console.log(`   ID: ${node.id}`);
    console.log(`   Price: ${node.price.amount} ${node.price.currencyCode}`);
    console.log(`   Available: ${node.availableForSale}`);
    console.log('');
  });

  // Output ready-to-use JSON
  console.log('\n─'.repeat(80));
  console.log('Ready-to-use loot pool items (copy this):');
  console.log('─'.repeat(80));

  const rarities = ['common', 'common', 'rare', 'epic', 'legendary'];
  const weights = [10, 10, 5, 3, 1];

  const items = data.product.variants.edges.map(({ node }, index) => ({
    productHandle: handle,
    variantId: node.id,
    rarity: rarities[index] || 'common',
    weight: weights[index] || 10,
    _comment: node.title
  }));

  console.log(JSON.stringify({ items }, null, 2));

} catch (error) {
  console.error('Error fetching product:', error.message);
  process.exit(1);
}
