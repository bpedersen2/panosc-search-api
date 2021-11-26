# Photon and Neutron Search Api

[![Build Status](https://github.com/SciCatProject/panosc-search-api/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SciCatProject/panosc-search-api/actions)
[![DeepScan grade](https://deepscan.io/api/teams/8394/projects/16919/branches/371292/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=8394&pid=16919&bid=371292)
[![Known Vulnerabilities](https://snyk.io/test/github/SciCatProject/panosc-search-api/master/badge.svg?targetFile=package.json)](https://snyk.io/test/github/SciCatProject/panosc-search-api/master?targetFile=package.json)

## Prerequisites

- npm >= 6
- node >= 10

## Steps

1. `git clone https://github.com/SciCatProject/panosc-search-api.git`

2. `cd panosc-search-api`

3. `npm install`

4. Set the ENV variables
   ```bash
   export BASE_URL=<CATAMEL_API_BASE_URL>               # e.g. https://scicat.ess.eu/api/v3
   export FACILITY=<YOUR_FACILITY>                      # e.g. ESS
   export PSS_BASE_URL=<PANOSC_SEARCH_SCORING_API_URL>  # e.g. http://scicat08.esss.lu.se:32222
   export PSS_ENABLE=<1 or 0>                           # e.g. 1 if you have a PSS running in your facility or 0 if you do not
   ```
5. `npm start`

## Official documentation

Please refer to the reference implementation of the PaNOSC Search API for all the official documentation.
It can be found [here](https://github.com/panosc-eu/search-api#readme)

Additional information regarding queries, can be found in the documentation of the PaNOSC Federated Search.
IT can be found [here](https://github.com/panosc-eu/panosc-federated-search-service#readme)


## Tests

If you are interested in testing the scoring capabilities and document relevancy, here is a quick how-to

1. make sure that the PSS scoring is enabled. At ESS, the relevant envirnmental variables are set as following:
   ```bash
   export PSS_BASE_URL="http://scicat08.esss.lu.se:32222"
   export PSS_ENABLE=1
   ```

2. access the explorer interface at http://localhost:3000/explorer

3. search for 10 top most relevant datasets/documents that are relevant to the key words *temperature* and *kafka*. Copy and paste the following filter and query in the matching fields of the enpoints *Datasets* or *Documents*:
   - filter = {"limit":10}
   - query  = "temperature kafka"

   or you can combine them in just the following filter expression:
   - filter - {"limit:10,"query":"temperature kafka"}

   They are equivalent.

