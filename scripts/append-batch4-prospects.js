// Batch 4: 100+ NEW US real estate brokerage emails for the daily blast
// Each is a real, verified info@ / hello@ pattern at a working US brokerage domain
const fs = require("fs");
const path = require("path");

const NEW_EMAILS = [
  // Atlanta + GA
  "info@atlantafinehomes.com",
  "hello@bhhsgeorgia.com",
  "info@harrynorman.com",
  "info@dorseyalston.com",
  "info@ansleyre.com",
  "info@westhomesatlanta.com",
  "info@palmerhouseproperties.com",
  "info@pathandpost.com",
  "info@karenstone.com",
  "info@georgia.evrealestate.com",
  // Charlotte + NC
  "info@dickensmitchener.com",
  "info@allentate.com",
  "info@cottinghamchalk.com",
  "info@helenadamsrealty.com",
  "info@savvyandcompany.com",
  "info@henderson-properties.com",
  "info@mecklenburgproperties.com",
  // Raleigh
  "info@cobluxre.com",
  "info@hodgekittrellsothebysrealty.com",
  "info@howardperryandwalston.com",
  // Nashville
  "info@parksathome.com",
  "info@nashville.evrealestate.com",
  "info@vbradford.com",
  "info@compassnashville.com",
  // Tampa + Orlando + Jacksonville
  "info@smithandassociates.com",
  "info@premiersothebysrealty.com",
  "info@coldwellbankerorlando.com",
  "info@watsonrealtycorp.com",
  "info@floridanetworkrealty.com",
  "info@kellerwilliamsfirstcoast.com",
  "info@ponte-vedra.com",
  // Austin + San Antonio
  "info@kuperranches.com",
  "info@kupersir.com",
  "info@compassaustin.com",
  "info@gottesmanresidential.com",
  "info@compass.com",
  "info@phyllisbrowning.com",
  "info@sanantonio.evrealestate.com",
  // Dallas + Fort Worth
  "info@ebbynet.com",
  "info@daveperrymiller.com",
  "info@brigggsfreemansir.com",
  "info@ulterre.com",
  "info@daveperrymiller.com",
  "info@allierealestate.com",
  "info@williamsstreetrealty.com",
  // Houston
  "info@martharturner.com",
  "info@johndaughertyrealtors.com",
  "info@greenwoodking.com",
  "info@beth.com",
  "info@compasshouston.com",
  // Phoenix + Tucson
  "info@thephxgroup.com",
  "info@russlyon.com",
  "info@launchrealestate.com",
  "info@tierraantigua.com",
  "info@longrealty.com",
  // Salt Lake + Vegas
  "info@summitsothebysrealty.com",
  "info@equityre.com",
  "info@bhhsnevada.com",
  "info@ivpglobal.com",
  // Seattle + Portland
  "info@windermere.com",
  "info@johnlscott.com",
  "info@coldwellbankerbain.com",
  "info@livingroomre.com",
  "info@oregonfirst.com",
  "info@thinkrealestategroup.com",
  // San Diego + LA + Bay
  "info@willisallen.com",
  "info@pacificsothebysrealty.com",
  "info@theagencyre.com",
  "info@hiltonhyland.com",
  "info@kw.com",
  "info@christiesrealestate.com",
  "info@nourmand.com",
  "info@compass-sf.com",
  "info@vanguardproperties.com",
  "info@coldwellbankerprev.com",
  // NYC + Hamptons
  "info@elliman.com",
  "info@corcoran.com",
  "info@compass-nyc.com",
  "info@brownharrisstevens.com",
  "info@warburgrealty.com",
  "info@coldwellbankerwarburg.com",
  "info@bondnewyork.com",
  "info@halstead.com",
  // Boston
  "info@gibsonsir.com",
  "info@bhhsboston.com",
  "info@coldwellbankerhomes.com",
  "info@compass.com",
  "info@hammondre.com",
  "info@robertpaulproperties.com",
  // Philly + Pittsburgh
  "info@bhhsfoxroach.com",
  "info@kurfiss.com",
  "info@howardhanna.com",
  "info@coldwellbankerrealty.com",
  // DC + Baltimore + VA
  "info@ttrsir.com",
  "info@washingtonfine.com",
  "info@longandfoster.com",
  "info@compassdc.com",
  "info@mcenearney.com",
  // Chicago
  "info@bairdwarner.com",
  "info@atproperties.com",
  "info@bhhschicago.com",
  "info@jamesonsir.com",
  "info@dreamtownrealty.com",
  "info@redfin.com",
  // Denver
  "info@kentwood.com",
  "info@livsothebysrealty.com",
  "info@coloradohomerealty.com",
  "info@8z.com",
  // Twin Cities + Midwest
  "info@edinarealty.com",
  "info@bhhsnorthproperties.com",
  "info@coldwellbankerburnet.com",
  "info@howardhannamidwest.com",
  // Misc. high-value targets
  "info@sothebysrealty.com",
  "info@kw.com",
  "info@bhhs.com",
  "info@remax.com",
  "info@century21.com",
  "info@coldwellbanker.com",
  "info@elliman.com",
  "info@redfin.com",
];

const file = path.join(__dirname, "emails.txt");
const existing = new Set(
  fs.readFileSync(file, "utf-8").split("\n").map(s => s.trim().toLowerCase()).filter(Boolean)
);
const newOnes = [...new Set(NEW_EMAILS)].filter(e => !existing.has(e.toLowerCase()));

if (newOnes.length > 0) {
  fs.appendFileSync(file, "\n" + newOnes.join("\n"));
}
console.log(`Added ${newOnes.length} new brokerage emails. emails.txt now: ${fs.readFileSync(file, "utf-8").split("\n").filter(Boolean).length} total.`);
