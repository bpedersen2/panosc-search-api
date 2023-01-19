"use strict";

const superagent = require("superagent");

const baseUrl = process.env.BASE_URL || "http://localhost:3030/api/v3";

const desyPub = require("../server/desy_pub.json");
const desyDs = require("../server/desy_ds.json");

exports.Dataset = class {
  /**
   * Query SciCat datasets matching filter
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat dataset objects
   */

  async find(filter) {
    const jsonFilter = JSON.stringify(filter);
    //console.log(">>> Dataset.find filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Datasets?filter=" + jsonFilter
      : baseUrl + "/Datasets";
    const res = await superagent.get(url);
    if (!filter.where)
      return JSON.parse(res.text).concat(desyDs);
    if
    (filter.where.and && filter.where.and.length > 0 &&
        filter.where.and.every(f => {
          if (f.pid === desyDs.pid)
            return true;
          else if (f["techniques.pid"] && f["techniques.pid"].inq.includes(desyDs.techniques[0].pid))
            return true;
          else if (f.or && f.or.length > 0 && f.or[1].and
          && f.or[1].and.length > 0 && f.or[1].and[0] &&
          f.or[1].and[0]["scientificMetadata.beamlineParameters.Beam energy.v"]) {
            const param = f.or[1].and[0]["scientificMetadata.beamlineParameters.Beam energy.v"];
            if (param.gte)
              return desyDs.scientificMetadata.beamlineParameters["Beam energy"].v >= param.gte;
            else if (param.lte)
              return desyDs.scientificMetadata.beamlineParameters["Beam energy"].v <= param.lte;
            else if (param.between)
              return desyDs.scientificMetadata.beamlineParameters["Beam energy"].v >= param.between[0] && desyDs.scientificMetadata.beamlineParameters["Beam energy"].v <= param.between[1];
          }
        }

        )
    )
      return JSON.parse(res.text).concat(desyDs);
    if (filter.where.pid === desyDs.pid)
      return [desyDs];
    return JSON.parse(res.text);
  }

  /**
   * Find a SciCat dataset by id
   * @param {string} id SciCat dataset pid
   * @param {object} filter SciCat loopback filter object
   * @returns {object} SciCat dataset object
   */

  async findById(id, filter) {
    const encodedId = encodeURIComponent(id);
    const jsonFilter = JSON.stringify(filter);
    //console.log(">>> Dataset.findById pid", encodedId);
    //console.log(">>> Dataset.findById filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Datasets/" + encodedId + "?filter=" + jsonFilter
      : baseUrl + "/Datasets/" + encodedId;
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }

  /**
   * Get count of SciCat datasets matching filter
   * @param {object} filter SciCat loopback filter object
   * @returns {object} Object with key `count` and number of matching SciCat datasets as value
   */

  async count(filter) {
    const jsonFilter = JSON.stringify(filter);
    //console.log(">>> Dataset.count filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Datasets?filter=" + jsonFilter
      : baseUrl + "/Datasets";
    const res = await superagent.get(url);
    const datasets = JSON.parse(res.text);
    return { count: datasets.length };
  }

  /**
   * Get origDatablocks for SciCat dataset
   * @param {string} id SciCat dataset pid
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat origDatablock objects
   */

  async findByIdFiles(id, filter) {
    const encodedId = encodeURIComponent(id);
    const jsonFilter = JSON.stringify(filter);
    //console.log(">>> Dataset.findByIdFiles pid", encodedId);
    //console.log(">>> Dataset.findByIdFiles filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Datasets/" + encodedId + "?filter=" + jsonFilter
      : baseUrl + "/Datasets/" + encodedId;
    const res = await superagent.get(url);
    return JSON.parse(res.text)["origdatablocks"];
  }
};

exports.PublishedData = class {
  /**
   * Query SciCat publications matching filter
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat publishedData objects
   */

  async find(filter) {
    console.log("PublishedData.find - BEGIN");
    const jsonFilter = JSON.stringify(filter);
    console.log("PublishedData.find filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/PublishedData?filter=" + jsonFilter
      : baseUrl + "/PublishedData";
    const res = await superagent.get(url);
    console.log("PublishedData.find - END");
    return JSON.parse(res.text).concat(desyPub).filter(
      r => ![
        "10.16907/1058aa1f-3ef0-45d8-b2a6-8675571b78bd", 
        "10.16907/011ddd1e-a3f6-48a2-950c-aafb7e793182"
      ].includes(r.doi));
  }

  /**
   * Find a SciCat publication by id
   * @param {string} id SciCat publishedData doi
   * @param {object} filter SciCat loopback filter object
   * @returns {object} SciCat publishedData object
   */

  async findById(id, filter) {
    const encodedId = encodeURIComponent(id);
    const jsonFilter = JSON.stringify(filter);
    //console.log(">>> PublishedData.findById pid", encodedId);
    //console.log(">>> PublishedData.findById filter", jsonFilter);
    if (id === desyPub.doi)
      return desyPub;
    const url = jsonFilter
      ? baseUrl + "/PublishedData/" + encodedId + "?filter=" + jsonFilter
      : baseUrl + "/PublishedData/" + encodedId;
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }

  /**
   * Get count of SciCat publications mathing query
   * @param {object} where SciCat where filter object
   * @returns {object} Object with key `count` and number of matching SciCat publications as value
   */

  async count(where) {
    const jsonWhere = JSON.stringify(where);
    //console.log(">>> PublishedData.count where", jsonWhere);
    const url = jsonWhere
      ? baseUrl + "/PublishedData/count?where=" + jsonWhere
      : baseUrl + "/PublishedData/count";
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }
};

exports.Instrument = class {
  /**
   * Query SciCat instruments matching query
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat instrument objects
   */

  async find(filter) {
    const jsonFilter = JSON.stringify(filter);
    //console.log(">>> Instrument.find filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Instruments?filter=" + jsonFilter
      : baseUrl + "/Instruments";
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }

  /**
   * Find a SciCat instrument by id
   * @param {string} id SciCat instrument id
   * @param {object} filter SciCat loopback filter object
   * @returns {object} SciCat instrument object
   */

  async findById(id, filter) {
    const encodedId = encodeURIComponent(id);
    const jsonFilter = JSON.stringify(filter);
    //console.log(">>> Instrument.findById id", encodedId);
    //console.log(">>> Instrument.findById filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Instruments/" + encodedId + "?filter=" + jsonFilter
      : baseUrl + "/Instruments/" + encodedId;
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }

  /**
   * Get count of SciCat instruments matching query
   * @param {object} where SciCat where filter object
   * @returns {object} Object with key `count` and number of matching SciCat instruments as value
   */

  async count(where) {
    const jsonWhere = JSON.stringify(where);
    //console.log(">>> Instrument.count where", jsonWhere);
    const url = jsonWhere
      ? baseUrl + "/Instruments/count?where=" + jsonWhere
      : baseUrl + "/Instruments/count";
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }
};

exports.Sample = class {
  /**
   * Query SciCat samples matching query
   * @param {object} filter SciCat loopback filter object
   * @returns {object[]} Array of SciCat sample objects
   */

  async find(filter) {
    const jsonFilter = JSON.stringify(filter);
    //console.log(">>> Sample.find filter", jsonFilter);
    const url = jsonFilter
      ? baseUrl + "/Samples?filter=" + jsonFilter
      : baseUrl + "/Samples";
    const res = await superagent.get(url);
    return JSON.parse(res.text);
  }
};

