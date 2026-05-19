const Site = require("../model/Site");

const defaultSite = {
  bitcoinAddress: "",
  bchAddress: "",
  ethereumAddress: "",
  usdtAddress: "",
};

async function getSite() {
  const site = await Site.findOne();
  return site || defaultSite;
}

module.exports = getSite;
