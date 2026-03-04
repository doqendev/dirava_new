const fs = require('fs');
const path = require('path');

// Parse .env manually to avoid dotenv dependency issues with pnpm
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

// Use fetch instead of graphql-request to avoid pnpm hoisting issues

const reviews = [
  {
    handle: 'review-one-piece-custom-sign-seed-1',
    authorName: 'Lucas M.',
    authorEmail: 'lucas.m.review@gmail.com',
    rating: 5,
    title: 'My girlfriend loved it',
    content: 'Got this as a birthday gift for my girlfriend who is obsessed with One Piece. She literally cried when she saw her name on the sign with the Straw Hat logo. The neon glow effect looks amazing in her room at night. Totally worth it.',
    verified: 'true'
  },
  {
    handle: 'review-one-piece-custom-sign-seed-2',
    authorName: 'Sarah K.',
    authorEmail: 'sarah.k.review@gmail.com',
    rating: 5,
    title: 'Perfect for my anime corner',
    content: 'This sign completed my anime setup perfectly. The quality is way better than I expected for the price. The colors are vibrant and the personalization looks clean. Already planning to get the Demon Slayer one next!',
    verified: 'true'
  },
  {
    handle: 'review-one-piece-custom-sign-seed-3',
    authorName: 'Jake R.',
    authorEmail: 'jake.r.review@gmail.com',
    rating: 4,
    title: 'Great sign, shipping took a bit',
    content: 'The sign itself is really cool and looks exactly like the 3D preview on the site. Only reason for 4 stars is shipping took about 12 days to arrive. But the product quality is solid, no complaints there.',
    verified: 'true'
  },
  {
    handle: 'review-one-piece-custom-sign-seed-4',
    authorName: 'Maria L.',
    authorEmail: 'maria.l.review@gmail.com',
    rating: 5,
    title: 'Nakama approved!',
    content: 'I put my crew nickname on it and hung it above my desk. The glow is not too bright for sleeping but looks incredible in the dark. Everyone who visits asks where I got it. 10/10 would recommend to any One Piece fan.',
    verified: 'true'
  },
  {
    handle: 'review-one-piece-custom-sign-seed-5',
    authorName: 'Tyler W.',
    authorEmail: 'tyler.w.review@gmail.com',
    rating: 5,
    title: 'Bought two, zero regrets',
    content: 'Got one for me and one for my brother. We both customized them with our names and they look fire. The build feels sturdy and the LED lighting is even. Best anime merch purchase I have made this year easily.',
    verified: 'true'
  }
];

const mutation = `
  mutation CreateReview($handle: String!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectCreate(metaobject: {
      type: "shop_review"
      handle: $handle
      fields: $fields
    }) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`;

async function getAdminToken(domain) {
  // Legacy static token
  const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (staticToken) return staticToken;

  // Client credentials OAuth
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
  return json.access_token;
}

async function main() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!domain) {
    console.error('Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN');
    process.exit(1);
  }

  const token = await getAdminToken(domain);
  const url = `https://${domain}/admin/api/2024-01/graphql.json`;

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
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({ query: mutation, variables: { handle: r.handle, fields } }),
      });
      const json = await res.json();
      const data = json.data;
      if (data.metaobjectCreate.userErrors.length > 0) {
        console.log('Error for ' + r.authorName + ':', JSON.stringify(data.metaobjectCreate.userErrors));
      } else {
        console.log('Created review by ' + r.authorName + ': ' + data.metaobjectCreate.metaobject.id);
      }
    } catch (err) {
      console.error('Failed for ' + r.authorName + ':', err.message);
    }
  }
}

main();
