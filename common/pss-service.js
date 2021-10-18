"use strict";

const superagent = require("superagent");

const baseUrl = process.env.PSS_BASE_URL || "http://localhost:8000";

exports.Score = class {

  pss_score_url = baseUrl + "/score";

  /**
   * request scoring to PSS subsystem
   * @param {str} query plain english query that we want to use for scoring our entries
   * @param {str[]} itemIds list of ids of the item we are requesting the scoring for
   * @param {str} group type of items that we are requesting the scoring on
   * @param {int} limit number of items we want returned
   * @returns {object[]} Array of the scores
   */
  async score(query, itemIds, group = "default", limit = -1) {

    console.log(">>> Score.score: score requested");
    console.log(" - query : ", query);
    console.log(" - number of items : ", itemIds.length);
    console.log(" - group : ", group);
    console.log(" - limit : ", limit);

    const res = await superagent
      .post(this.pss_score_url)
      .send({
        query: query,
        itemIds: itemIds,
        group: group,
        limit: limit
      })

    const json_res = JSON.parse(res.text);

    const scores = Object.assign({}, ...json_res.scores.map((i) => ({ [i.itemId]: i.score })));
    //const scores = json_res.scores.reduce((a,i) => ({...a, [i.itemId]: i.score}), {})

    return scores
  }

}
