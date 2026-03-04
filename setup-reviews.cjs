const fs = require('fs');
const path = require('path');

// Parse .env
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

async function getToken(domain) {
  const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (staticToken) return staticToken;

  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Set SHOPIFY_ADMIN_ACCESS_TOKEN or both SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET');
    process.exit(1);
  }

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }),
  });
  if (!res.ok) {
    console.error('OAuth token fetch failed:', res.status, await res.text());
    process.exit(1);
  }
  const json = await res.json();
  console.log('OAuth token acquired (expires in ' + json.expires_in + 's)');
  return json.access_token;
}

const definitionMutation = `
  mutation {
    metaobjectDefinitionCreate(definition: {
      type: "shop_review"
      name: "Product Review"
      fieldDefinitions: [
        { key: "product_handle", name: "Product Handle", type: "single_line_text_field", required: true }
        { key: "author_name", name: "Author Name", type: "single_line_text_field", required: true }
        { key: "author_email", name: "Author Email", type: "single_line_text_field", required: true }
        { key: "rating", name: "Rating", type: "number_integer", required: true }
        { key: "title", name: "Title", type: "single_line_text_field" }
        { key: "content", name: "Content", type: "multi_line_text_field", required: true }
        { key: "status", name: "Status", type: "single_line_text_field", required: true }
        { key: "verified_purchase", name: "Verified Purchase", type: "single_line_text_field" }
        { key: "order_id", name: "Order ID", type: "single_line_text_field" }
        { key: "review_images", name: "Review Images", type: "single_line_text_field" }
      ]
    }) {
      metaobjectDefinition { id type }
      userErrors { field message }
    }
  }
`;

const reviewMutation = `
  mutation CreateReview($handle: String!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectCreate(metaobject: { type: "shop_review", handle: $handle, fields: $fields }) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`;

const reviews = [
  { handle: 'review-one-piece-custom-sign-seed-1', authorName: 'Lucas M.', authorEmail: 'lucas.m.review@gmail.com', rating: 5, title: 'My girlfriend loved it', content: 'Got this as a birthday gift for my girlfriend who is obsessed with One Piece. She literally cried when she saw her name on the sign with the Straw Hat logo. The neon glow effect looks amazing in her room at night. Totally worth it.', verified: 'true' },
  { handle: 'review-one-piece-custom-sign-seed-2', authorName: 'Sarah K.', authorEmail: 'sarah.k.review@gmail.com', rating: 5, title: 'Perfect for my anime corner', content: 'This sign completed my anime setup perfectly. The quality is way better than I expected for the price. The colors are vibrant and the personalization looks clean. Already planning to get the Demon Slayer one next!', verified: 'true' },
  { handle: 'review-one-piece-custom-sign-seed-3', authorName: 'Jake R.', authorEmail: 'jake.r.review@gmail.com', rating: 4, title: 'Great sign, shipping took a bit', content: 'The sign itself is really cool and looks exactly like the 3D preview on the site. Only reason for 4 stars is shipping took about 12 days to arrive. But the product quality is solid, no complaints there.', verified: 'true' },
  { handle: 'review-one-piece-custom-sign-seed-4', authorName: 'Maria L.', authorEmail: 'maria.l.review@gmail.com', rating: 5, title: 'Nakama approved!', content: 'I put my crew nickname on it and hung it above my desk. The glow is not too bright for sleeping but looks incredible in the dark. Everyone who visits asks where I got it. 10/10 would recommend to any One Piece fan.', verified: 'true' },
  { handle: 'review-one-piece-custom-sign-seed-5', authorName: 'Tyler W.', authorEmail: 'tyler.w.review@gmail.com', rating: 5, title: 'Bought two, zero regrets', content: 'Got one for me and one for my brother. We both customized them with our names and they look fire. The build feels sturdy and the LED lighting is even. Best anime merch purchase I have made this year easily.', verified: 'true' },
];

async function main() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!domain) {
    console.error('Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN');
    process.exit(1);
  }

  const token = await getToken(domain);
  const url = `https://${domain}/admin/api/2024-01/graphql.json`;
  const headers = { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token };

  // Step 1: Create metaobject definition
  console.log('\n=== Creating shop_review metaobject definition ===');
  const defRes = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ query: definitionMutation }) });
  const defJson = await defRes.json();

  if (defJson.errors) {
    console.error('GraphQL errors:', JSON.stringify(defJson.errors, null, 2));
    process.exit(1);
  }

  const defData = defJson.data.metaobjectDefinitionCreate;

  if (defData.userErrors.length > 0) {
    const alreadyExists = defData.userErrors.some(e => e.message.includes('already') || e.message.includes('taken'));
    if (alreadyExists) {
      console.log('Definition already exists, continuing...');
    } else {
      console.error('Failed:', JSON.stringify(defData.userErrors, null, 2));
      process.exit(1);
    }
  } else {
    console.log('Created definition:', defData.metaobjectDefinition.type);
  }

  // Step 2: Seed reviews
  console.log('\n=== Seeding reviews ===');
  for (const r of reviews) {
    const fields = [
      { key: 'product_handle', value: 'one-piece-custom-sign' },
      { key: 'author_name', value: r.authorName },
      { key: 'author_email', value: r.authorEmail },
      { key: 'rating', value: r.rating.toString() },
      { key: 'title', value: r.title },
      { key: 'content', value: r.content },
      { key: 'status', value: 'approved' },
      { key: 'verified_purchase', value: r.verified },
    ];

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: reviewMutation, variables: { handle: r.handle, fields } }),
      });
      const json = await res.json();
      const data = json.data.metaobjectCreate;
      if (data.userErrors.length > 0) {
        console.log('  ' + r.authorName + ':', data.userErrors.map(e => e.message).join(', '));
      } else {
        console.log('  ' + r.authorName + ': ' + data.metaobject.id);
      }
    } catch (err) {
      console.error('  Failed for ' + r.authorName + ':', err.message);
    }
  }

  console.log('\nDone!');
}

main();
