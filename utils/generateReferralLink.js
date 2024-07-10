// utils/generateReferralLink.js
function generateReferralLink(id) {
  return `https://mlm-client.vercel.app/api/v1/register?ref=${id}`;
}

module.exports = generateReferralLink;
