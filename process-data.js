import { collect, pointsWithinPolygon } from "@turf/turf";
import fs from "fs";
import sites from "./map/sites.json" with { type: "json" };
import neighborhoods from "./map/LA_Times_Neighborhood_Boundaries.json" with { type: "json" };

sites.features.forEach((feature) => {
    feature.properties = {
        count: 1
    }
});

const neighborhoodsWithSites = collect(neighborhoods,
                                       sites,
                                       "count",
                                       "sitesCount");

neighborhoodsWithSites.features.forEach((feature) => {
    feature.properties.sitesCount = feature.properties.sitesCount.length;
})

// neighborhoods.features.foreach((feature) => {
//     feature.properties.sitesCount = pointsWithinPolygon(sites, feature).features.length
// })

fs.writeFileSync("./map/neighborhoods-with-sites.json", JSON.stringify(neighborhoodsWithSites, null, "\t"));

console.log("success. 👍");