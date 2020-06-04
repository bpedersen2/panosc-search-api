'use strict';

const superagent = require('superagent');
const baseUrl = 'https://scicat.esss.se/api/v3';

class Dataset {
  constructor() {}

  async find(filter) {
    try {
      console.log('>>> FIND FILTER', filter);
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/Datasets?filter=' + jsonFilter
        : baseUrl + '/Datasets';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      return err;
    }
  }

  async findById(id, filter) {
    try {
      if (!filter) {
        filter = {where: {pid: id}};
      } else {
        if (!filter.where) {
          filter.where = {pid: id};
        } else {
          filter.where['pid'] = id;
        }
      }
      console.log('>>> FINDBYID FILTER', filter);
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/Datasets/?filter=' + jsonFilter
        : baseUrl + '/Datasets';
      const res = await superagent.get(url);
      return JSON.parse(res.text)[0];
    } catch (err) {
      return err;
    }
  }

  async count(where) {
    try {
      console.log('>>> COUNT FILTER', {where});
      const jsonFilter = JSON.stringify({where});
      const url = jsonFilter
        ? baseUrl + '/Datasets?filter=' + jsonFilter
        : baseUrl + '/Datasets';
      const res = await superagent.get(url);
      const datasets = JSON.parse(res.text);
      return {count: datasets.length};
    } catch (err) {
      return err;
    }
  }

  async findByIdFiles(id, filter) {
    try {
      if (!filter) {
        filter = {where: {pid: id}, include: [{relation: 'origdatablocks'}]};
      } else {
        if (!filter.where) {
          filter.where = {pid: id};
        } else {
          filter.where['pid'] = id;
        }
        if (!filter.include) {
          filter.include = [{relation: 'origdatablocks'}];
        } else {
          filter.include.push({relation: 'origdatablocks'});
        }
      }
      console.log('>>> FINDBYIDFILES FILTER', filter);
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/Datasets?filter=' + jsonFilter
        : baseUrl + '/Datasets';
      const res = await superagent.get(url);
      return JSON.parse(res.text)[0]['origdatablocks'];
    } catch (err) {
      return err;
    }
  }

  async countFiles(id, where) {
    try {
      const filter = {where};
      if (!filter) {
        filter = {where: {pid: id}};
      } else {
        if (!filter.where) {
          filter.where = {pid: id};
        } else {
          filter.where['pid'] = id;
        }
      }
      filter.include = [{relation: 'origdatablocks'}];
      console.log('>>> COUNTFILES FILTER', filter);
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/Datasets?filter=' + jsonFilter
        : baseUrl + '/Datasets';
      const res = await superagent.get(url);
      const files = JSON.parse(res.text)[0]['origdatablocks'];
      return {count: files.length};
    } catch (err) {
      return err;
    }
  }
}

class PublishedData {
  constructor() {}

  async find(filter) {
    try {
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/PublishedData?filter=' + jsonFilter
        : baseUrl + '/PublishedData';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      return err;
    }
  }

  async findById(id, filter) {
    try {
      const encodedId = encodeURIComponent(id);
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/PublishedData/' + encodedId + '?filter=' + jsonFilter
        : baseUrl + '/PublishedData/' + encodedId;
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      return err;
    }
  }

  async count(where) {
    try {
      const jsonWhere = JSON.stringify(where);
      const url = jsonWhere
        ? baseUrl + '/PublishedData/count?where=' + jsonWhere
        : baseUrl + '/PublishedData/count';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      return err;
    }
  }
}

class Instrument {
  constructor() {}

  async find(filter) {
    try {
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/Instruments?filter=' + jsonFilter
        : baseUrl + '/Instruments';
      const res = await superagent.get(url);
    } catch (err) {
      return err;
    }
  }

  async findById(id, filter) {
    try {
      const encodedId = encodeURIComponent(id);
      const jsonFilter = JSON.stringify(filter);
      const url = jsonFilter
        ? baseUrl + '/Instruments/' + encodedId + '?filter=' + jsonFilter
        : baseUrl + '/Instruments/' + encodedId;
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      return err;
    }
  }

  async count(where) {
    try {
      const jsonWhere = JSON.stringify(where);
      const url = jsonWhere
        ? baseUrl + '/Instruments/count?where=' + jsonWhere
        : baseUrl + '/Instruments/count';
      const res = await superagent.get(url);
      return JSON.parse(res.text);
    } catch (err) {
      return err;
    }
  }
}

module.exports = {
  Dataset: Dataset,
  PublishedData: PublishedData,
  Instrument: Instrument,
};