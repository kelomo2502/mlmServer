// utils/generateReferralLink.js
function generateReferralLink(id) {
  return `http://localhost:5173/register?ref=${id}`;
}

module.exports = generateReferralLink;
