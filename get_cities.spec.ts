import { test, expect } from '@playwright/test';
import * as config from '../../../../playwright.config';
import { allure } from 'allure-playwright';
import { ApiUtils } from '../../../utils/api-utils';
import { ApiPortalUtils } from '../../../api-method/api-portal/api-methods';
import * as owner from "../../../utils/owners.json";
import {MysqlQueries} from '../../../database/queries-mysql';

const TokenProperty = 'access_token';
const pageNumber = [null, 1, 2, 10, 20];
const invalidPageNumber = [0, 50];
const invalidPageSize = [-1, 5, 9, 501, 1000];
const invalidOrderBy = ['names', 'industry', 'fullAddress', 'country', 'city', 'createdOn', 'companyContactNumber' ];
const pageSize = [null, 10, 11, 50, 499, 500];
const orderBy = [null, 'name', 'id'];
const desc = [null, true, false];
const countryCode = ['US', 'MX'];
const countryCodeNoData = 'YY';
const invalidCountryCode = ['U', 'JJJ', '4354'];
const countryCodeNull = null;

test.describe("API Portal. GET Cities reqest @skip", () => {
  let apiPortalUtils: ApiPortalUtils;
  let apiUtils: ApiUtils;
  let token: string;
  let response: any
  let userProfileResponse: any;

  test.beforeEach(async () => {
    allure.owner(owner['Serhiy Maksiuta']);
    apiUtils = new ApiUtils();
    apiPortalUtils = new ApiPortalUtils();
    const email = config.EMAIL;
    const password = config.PASSWORD;

    await test.step(`LOGIN`, async () => {
      response = await apiUtils.postAuthServiceLogin(email, password);
    });

    await test.step(`CHECKING that the login was correct`, async () => {
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty(TokenProperty);
      expect(response.data.access_token).not.toBeNull();
      expect(response.data.access_token).not.toBeUndefined();
    });

    await test.step(`TAKE token`, async () => {
      token = response.data.access_token;
    });

    return { apiPortalUtils, token, response, userProfileResponse };
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities without parameters', async ({ }) => {

    await test.step(`SENDING a request`, async () => {

      userProfileResponse = await apiPortalUtils.getCities(token, countryCode[0], pageNumber[0], pageSize[1], orderBy[0], desc[0]);
    });

    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.status).toBe(200);
    });
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with checking ordering by email ', async ({ }) => {
    const qr = new MysqlQueries;
      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCities(token, countryCode[0], pageNumber[1], pageSize[3], orderBy[1], desc[0]);
      });
  
      await test.step(`Compare names cities from Database and Response API`, async () => {
        const namesCitiesFromResponse = userProfileResponse.data.data.map((item: { name: string }) => item.name);
        const namesCitiesFromQuery = await qr.getCitiesOrderByName();      
        const namesString = namesCitiesFromQuery.map((item: any) => item.Name);  
        expect(namesCitiesFromResponse).toEqual(expect.arrayContaining(namesString));
      });   
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with all valid parameters', async ({ }) => {

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getCities(token, countryCode[1], pageNumber[2], pageSize[3], orderBy[1], desc[2]);
    });

    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.status).toBe(200);
    });
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities without CountryCode', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getCities(token, countryCodeNull, pageNumber[0], pageSize[0], orderBy[0], desc[0]);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Property 'countryCode' validation error. The field countryCode must be a string or array type with a maximum length of '2'.";   
      expect(userProfileResponse.error.status).toBe(400);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with checking all parameters for ordering', async ({ }) => {
    for (let i = 0; i < orderBy.length; i++) {
      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCities(token, countryCode[0], pageNumber[1], pageSize[5], orderBy[i], desc[2]);
      });

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
      });
    }
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with checking all parameters for sorting', async ({ }) => {
    for (let i = 0; i < desc.length; i++) {

      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCities(token, countryCode[0], pageNumber[1], pageSize[1], orderBy[1], desc[i]);
      });

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
      });
    }
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with checking valid numbers of Page Size', async ({ }) => {
    for (let i = 0; i < pageSize.length; i++) {

      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCities(token, countryCode[0], pageNumber[1], pageSize[i], orderBy[1], desc[1]);
      });

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
      });
    }
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with invalid() numbers of Page Size( check 400 error)', async ({ }) => {    
    let errorMessage: string;

    for (let i = 0; i < invalidPageSize.length; i++) {

      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCities(token, countryCode[0], pageNumber[1], invalidPageSize[i], orderBy[1], desc[1]);
      });

      errorMessage = invalidPageSize[i] < 10 ? "Property 'PageSize' validation error. PageSize must be greater than 10 or be equal to" : "Property 'PageSize' validation error. PageSize must be less than 500 or be equal to";
      
      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.error.status).toBe(400);
        expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
        expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
      });
    }
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with invalid Page Number( check 400 error)', async ({ }) => {    
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCities(token, countryCode[0], invalidPageNumber[0], pageSize[1], orderBy[1], desc[1]);    
      });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Property 'PageNumber' validation error. Page doesn't exist";
      expect(userProfileResponse.error.status).toBe(400);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with invalid names OrderBy( check 400 error)', async ({ }) => {   
    let errorMessage: string;
    for (let i = 0; i < invalidOrderBy.length; i++) {

      await test.step(`SENDING a request`, async () => {
          userProfileResponse = await apiPortalUtils.getCities(token, countryCode[0], pageNumber[1], pageSize[1], invalidOrderBy[i], desc[1]);
      });

      await test.step(`CHECK response`, async () => {
        errorMessage = "Unable to order by property '" + invalidOrderBy[i]+ "'";
        expect(userProfileResponse.error.status).toBe(400);
        expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
        expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
      });
    };
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with invalid countryCode( check 400 error)', async ({ }) => {   
    let errorMessage: string;
    for (let i = 0; i < invalidCountryCode.length; i++) {

      await test.step(`SENDING a request`, async () => {
          userProfileResponse = await apiPortalUtils.getCities(token, invalidCountryCode[i], pageNumber[1], pageSize[1], orderBy[1], desc[1]);
      });
      errorMessage = invalidCountryCode[i].length < 2 ? "Property 'countryCode' validation error. The field countryCode must be a string or array type with a minimum length of '2'." : "Property 'countryCode' validation error. The field countryCode must be a string or array type with a maximum length of '2'.";
     
      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.error.status).toBe(400);
        expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
        expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
      });
    };
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with not available countryCode ( check 404 error)', async ({ }) => {   
    let errorMessage: string;
    
      await test.step(`SENDING a request`, async () => {
          userProfileResponse = await apiPortalUtils.getCities(token, countryCodeNoData, pageNumber[1], pageSize[0], orderBy[1], desc[1]);
      });

      await test.step(`CHECK response`, async () => {
        errorMessage = "There are no data for any Cities for the country with the code " + countryCodeNoData + " on the page " + pageNumber[1] + ".";
        expect(userProfileResponse.error.status).toBe(404);
        expect(userProfileResponse.error).toHaveProperty('data.Code', 404);
        expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
      });
    });
  });

test.describe("CHECK request without rights to response", () => {
  let apiUtils: ApiUtils;
  let apiPortalUtils: ApiPortalUtils;
  let token: string;
  let response: any;
  let userProfileResponse: any;

  test.beforeEach(async () => {
    allure.owner(owner['Serhiy Maksiuta']);
    apiUtils = new ApiUtils();
    apiPortalUtils = new ApiPortalUtils();
    const email = 'test_wave@test.com';
    const password = 'Redirect_123';

    await test.step(`LOGIN`, async () => {
      response = await apiUtils.postAuthServiceLogin(email, password);
    });

    await test.step(`CHECKING that the login was correct`, async () => {
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty(TokenProperty);
      expect(response.data.access_token).not.toBeNull();
      expect(response.data.access_token).not.toBeUndefined();
    });

    await test.step(`TAKE token`, async () => {
      token = response.data.access_token;
    });
  });
  
  test('Request /api/v1/normalized-data/country-data/:countryCode/cities with token from user with role SMB Dashboard', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getCities(token, countryCode[0], pageNumber[0], pageSize[0], orderBy[0], desc[0]);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Access Denied.";
      expect(userProfileResponse.error.status).toBe(403);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 403);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });
});
