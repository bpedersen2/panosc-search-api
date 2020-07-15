'use strict';

const mappings = require('./mappings');
const utils = require('./utils');

exports.dataset = (filter) => {
  if (!filter) {
    return null;
  } else {
    let scicatFilter = {};
    if (filter.where) {
      scicatFilter.where = mapWhereFilter(filter.where, 'dataset');
    }
    if (filter.include) {
      const parameters = filter.include.find(
        (inclusion) => inclusion.relation === 'parameters',
      );
      if (parameters && parameters.scope && parameters.scope.where) {
        scicatFilter = mapParameters(parameters, scicatFilter);
      }
      const techniques = filter.include.find(
        (inclusion) => inclusion.relation === 'techniques',
      );
      if (techniques && techniques.scope && techniques.scope.where) {
        scicatFilter = mapTechniques(techniques, scicatFilter);
      }
      const include = filter.include
        .filter((inclusion) => inclusion.relation !== 'parameters')
        .filter((inclusion) => inclusion.relation !== 'samples')
        .filter((inclusion) => inclusion.relation !== 'techniques');
      if (include.length > 0) {
        scicatFilter.include = mapIncludeFilter(include);
      }
    }
    if (filter.skip) {
      scicatFilter.skip = filter.skip;
    }
    if (filter.limit) {
      scicatFilter.limit = filter.limit;
    }
    return scicatFilter;
  }
};

exports.document = (filter) => {
  if (!filter) {
    return null;
  } else {
    let scicatFilter = {};
    if (filter.where) {
      if (filter.where.and) {
        filter.where.and = filter.where.and
          .filter((where) => !Object.keys(where).includes('isPublic'))
          .filter((where) => !Object.keys(where).includes('type'));
        if (filter.where.and.length > 0) {
          scicatFilter.where = mapWhereFilter(filter.where, 'document');
        }
      } else if (filter.where.or) {
        filter.where.or = filter.where.or
          .filter((where) => !Object.keys(where).includes('isPublic'))
          .filter((where) => !Object.keys(where).includes('type'));
        if (filter.where.or.length > 0) {
          scicatFilter.where = mapWhereFilter(filter.where, 'document');
        }
      } else {
        delete filter.where.isPublic;
        delete filter.where.type;
        if (Object.keys(filter.where).length > 0) {
          scicatFilter.where = mapWhereFilter(filter.where, 'document');
        }
      }
    }
    if (filter.include) {
      const members = filter.include.find(
        (inclusion) => inclusion.relation === 'members',
      );
      console.log('>>> document filter.include members', members);

      if (members && members.scope) {
        scicatFilter = mapMembers(members, scicatFilter);
      }

      const include = filter.include
        .filter((inclusion) => inclusion.relation !== 'datasets')
        .filter((inclusion) => inclusion.relation !== 'members');
      if (include.length > 0) {
        scicatFilter.include = mapIncludeFilter(include);
      }
    }
    if (filter.skip) {
      scicatFilter.skip = filter.skip;
    }
    if (filter.limit) {
      scicatFilter.limit = filter.limit;
    }
    return scicatFilter;
  }
};

exports.files = (filter) => {
  if (!filter) {
    return null;
  } else {
    return filter;
  }
};

exports.instrument = (filter) => {
  if (!filter) {
    return null;
  } else {
    let scicatFilter = {};
    if (filter.where) {
      if (filter.where.and) {
        filter.where.and = filter.where.and.filter(
          (where) => !Object.keys(where).includes('facility'),
        );
      } else if (filter.where.or) {
        filter.where.or = filter.where.or.filter(
          (where) => !Object.keys(where).includes('facility'),
        );
      } else {
        if (filter.where.facility) {
          delete filter.where.facility;
        }
      }
      if (Object.keys(filter.where).length > 0) {
        scicatFilter.where = mapWhereFilter(filter.where, 'instrument');
      }
    }
    if (filter.include) {
      scicatFilter.include = filter.include;
    }
    if (filter.skip) {
      scicatFilter.skip = filter.skip;
    }
    if (filter.limit) {
      scicatFilter.limit = filter.limit;
    }
    if (Object.keys(scicatFilter).length > 0) {
      return scicatFilter;
    } else {
      return null;
    }
  }
};

exports.sample = (filter) => {
  if (!filter) {
    return null;
  } else {
    let scicatFilter = {};
    if (filter.where) {
      scicatFilter.where = mapWhereFilter(filter.where, 'samples');
    }
    return scicatFilter;
  }
};

const mapWhereFilter = (where, model) => {
  console.log('>>> mapWhereFilter where', where);
  console.log('>>> mapWhereFilter model', model);
  let scicatWhere = {};
  if (where.and) {
    switch (model) {
      case 'dataset': {
        scicatWhere.and = where.and.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatDataset[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'document': {
        scicatWhere.and = where.and.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatDocument[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'files': {
        scicatWhere.and = where.and.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatFile[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'instrument': {
        scicatWhere.and = where.and;
        break;
      }
      case 'parameters': {
        const {name, value, unit} = utils.extractParamaterFilter(where);
        if (name) {
          console.log('>>> parameter name', name);
          scicatWhere.and = [];
          if (value) {
            console.log('>>> parameter value', value);
            if (unit) {
              console.log('>>> parameter unit', unit);
              if (isNaN(value)) {
                const extractedValue = Object.values(value).pop();
                if (Array.isArray(extractedValue)) {
                  const arrayValues = extractedValue.map((value) =>
                    utils.convertToSI(value, unit),
                  );
                  const formattedValueSI = Object.assign(
                    ...Object.keys(value).map((key) => ({
                      [key]: arrayValues.map((item) => item.valueSI),
                    })),
                  );
                  const unitSI = arrayValues.pop().unitSI;
                  scicatWhere.and.push({
                    [`scientificMetadata.${name}.valueSI`]: formattedValueSI,
                  });
                  scicatWhere.and.push({
                    [`scientificMetadata.${name}.unitSI`]: unitSI,
                  });
                } else {
                  const {valueSI, unitSI} = utils.convertToSI(
                    extractedValue,
                    unit,
                  );
                  const formattedValueSI = Object.assign(
                    ...Object.keys(value).map((key) => ({[key]: valueSI})),
                  );
                  scicatWhere.and.push({
                    [`scientificMetadata.${name}.valueSI`]: formattedValueSI,
                  });
                  scicatWhere.and.push({
                    [`scientificMetadata.${name}.unitSI`]: unitSI,
                  });
                }
              } else {
                const {valueSI, unitSI} = utils.convertToSI(value, unit);
                scicatWhere.and.push({
                  [`scientificMetadata.${name}.valueSI`]: valueSI,
                });
                scicatWhere.and.push({
                  [`scientificMetadata.${name}.unitSI`]: unitSI,
                });
              }
            } else {
              scicatWhere.and.push({
                [`scientificMetadata.${name}.value`]: value,
              });
            }
          } else {
            const err = new Error();
            err.name = 'FilterError';
            err.message = 'Parameter value was not provided';
            err.statusCode = 400;
            throw err;
          }
        } else {
          const err = new Error();
          err.name = 'FilterError';
          err.message = 'Parameter name was not provided';
          err.statusCode = 400;
          throw err;
        }
        break;
      }
      case 'samples': {
        scicatWhere.and = where.and.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatSample[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'techniques': {
        scicatWhere.and = where.and.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatTechniques[key]]: item[key],
            })),
          ),
        );
        break;
      }
    }
  } else if (where.or) {
    switch (model) {
      case 'dataset': {
        scicatWhere.or = where.or.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatDataset[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'document': {
        scicatWhere.or = where.or.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatDocument[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'instrument': {
        scicatWhere.or = where.or;
        break;
      }
      case 'files': {
        scicatWhere.or = where.or.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatFile[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'samples': {
        scicatWhere.or = where.or.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatSample[key]]: item[key],
            })),
          ),
        );
        break;
      }
      case 'techniques': {
        scicatWhere.or = where.or.map((item) =>
          Object.assign(
            ...Object.keys(item).map((key) => ({
              [mappings.panoscToScicatTechniques[key]]: item[key],
            })),
          ),
        );
        break;
      }
    }
  } else {
    switch (model) {
      case 'dataset': {
        scicatWhere = Object.assign(
          ...Object.keys(where).map((key) => ({
            [mappings.panoscToScicatDataset[key]]: where[key],
          })),
        );
        break;
      }
      case 'document': {
        scicatWhere = Object.assign(
          ...Object.keys(where).map((key) => ({
            [mappings.panoscToScicatDocument[key]]: where[key],
          })),
        );
        break;
      }
      case 'files': {
        scicatWhere = Object.assign(
          ...Object.keys(where).map((key) => ({
            [mappings.panoscToScicatFile[key]]: where[key],
          })),
        );
        break;
      }
      case 'instrument': {
        scicatWhere = where;
        break;
      }
      case 'members': {
        scicatWhere.or = [
          Object.assign(
            ...Object.keys(where).map((key) => ({
              creator: where[key],
              authors: where[key],
            })),
          ),
        ];
        break;
      }
      case 'samples': {
        scicatWhere = Object.assign(
          ...Object.keys(where).map((key) => ({
            [mappings.panoscToScicatSample[key]]: where[key],
          })),
        );
        break;
      }
      case 'techniques': {
        scicatWhere = Object.assign(
          ...Object.keys(where).map((key) => ({
            [mappings.panoscToScicatTechniques[key]]: where[key],
          })),
        );
        break;
      }
    }
  }
  console.log('>>>> scicatWhere', scicatWhere);
  return scicatWhere;
};

const mapIncludeFilter = (include) =>
  include.map((item) => {
    let inclusion = {};
    switch (item.relation) {
      case 'files': {
        inclusion.relation = 'origdatablocks';
        if (item.scope) {
          inclusion.scope = {};
          if (item.scope.where) {
            inclusion.scope.where = mapWhereFilter(
              item.scope.where,
              item.relation,
            );
          }
        }
        break;
      }
      case 'instrument': {
        inclusion.relation = 'instrument';
        if (item.scope) {
          if (item.scope.where && item.scope.where.facility) {
            delete item.scope.where.facility;
          }
          inclusion.scope = item.scope;
        }
        break;
      }
      case 'samples': {
        break;
      }
      case 'techniques': {
        break;
      }
      default: {
        break;
      }
    }

    console.log('>>> inclusion', JSON.stringify(inclusion));
    return inclusion;
  });

function mapMembers(members, filter) {
  const person = members.scope.include.find(
    (inclusion) => inclusion.relation === 'person',
  );
  if (person.scope && person.scope.where) {
    if (filter.where) {
      const scicatMembers = mapWhereFilter(
        person.scope.where,
        members.relation,
      );
      if (filter.where.and) {
        filter.where.and = filter.where.and.concat(scicatMembers);
      } else if (filter.where.or) {
        filter.where.and = scicatMembers.concat({
          or: filter.where.or,
        });
        delete filter.where.or;
      } else {
        filter.where = {and: scicatMembers.concat(filter.where)};
      }
    } else {
      filter.where = mapWhereFilter(person.scope.where, members.relation);
    }
  }
  return filter;
}

const mapParameters = (parameters, filter) => {
  if (filter.where) {
    const scicatParameters = mapWhereFilter(
      parameters.scope.where,
      parameters.relation,
    )['and'];
    if (filter.where.and) {
      filter.where.and = filter.where.and.concat(scicatParameters);
    } else if (filter.where.or) {
      filter.where.and = scicatParameters.concat({
        or: filter.where.or,
      });
      delete filter.where.or;
    } else {
      filter.where = {
        and: scicatParameters.concat(filter.where),
      };
    }
  } else {
    filter.where = mapWhereFilter(parameters.scope.where, parameters.relation);
  }
  return filter;
};

const mapTechniques = (techniques, filter) => {
  if (filter.where) {
    const scicatTechniques = mapWhereFilter(
      techniques.scope.where,
      techniques.relation,
    );
    if (filter.where.and) {
      filter.where.and = filter.where.and.concat(scicatTechniques);
    } else if (filter.where.or) {
      filter.where.and = scicatTechniques.concat({or: filter.where.or});
      delete filter.where.or;
    } else {
      filter.where = {and: scicatTechniques.concat(filter.where)};
    }
  } else {
    filter.where = mapWhereFilter(techniques.scope.where, techniques.relation);
  }
  return filter;
};
