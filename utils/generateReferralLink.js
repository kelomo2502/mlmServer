// utils/generateReferralLink.js
function generateReferralLink(id) {
  return `http://localhost:3100/register?ref=${id}`;
}

module.exports = generateReferralLink;
