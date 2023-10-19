import { test, expect } from '@playwright/test';
import * as config from '../../../../playwright.config';
import { allure } from 'allure-playwright';
import { ApiUtils } from '../../../utils/api-utils';
import * as owner from "../../../utils/owners.json";
import { ApiPortalUtils } from '../../../api-method/api-portal/api-methods';
import {MysqlQueries} from '../../../database/queries-mysql';

const TokenProperty = 'access_token';
const countryCode = ['US', 'MX'];
const countryCodeNoData = 'YY';
const invalidCountryCode = ['U', 'JJJ', '4354'];
const countryCodeNull = null;

test.describe("API Portal. GET Country code reqest @skip", () => {
  let apiUtils: ApiUtils;
  let apiPortalUtils: ApiPortalUtils;
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

    return { apiUtils, token, response, userProfileResponse };
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode with valid cods', async ({ }) => {

    for (let i = 0; i < countryCode.length; i++) {
      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCountryCode(token, countryCode[i]);
      });

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data.charCode2).toBe(countryCode[i]);
        expect(userProfileResponse.data.isEnabled).toBe(true);
      });
    };
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode with invalid cods', async ({ }) => {
    let errorMessage: string;
    for (let i = 0; i < invalidCountryCode.length; i++) {

      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCountryCode(token, invalidCountryCode[i]);
      });

      errorMessage = invalidCountryCode[i].length < 2 ? "Property 'countryCode' validation error. The field countryCode must be a string or array type with a minimum length of '2'." : "Property 'countryCode' validation error. The field countryCode must be a string or array type with a maximum length of '2'.";

      await test.step(`CHECK response`, async () => {      
        expect(userProfileResponse.error.status).toBe(400);
        expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
        expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
      });
    };
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode Comparison of the response with the database ', async ({ }) => {
    const qr = new MysqlQueries;
      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCountryCode(token, countryCode[0]);
      });
  
      await test.step(`Compare names identifiers from Database and Response API`, async () => {
        const namesIdentifiersFromResponse = userProfileResponse.data.identifierTypes;
        const namesIdentifiersFromQuery = await qr.getIdentifiersForUsa(countryCode[0]);
        const namesString = namesIdentifiersFromQuery.map((item: any) => item.Name);
        expect(namesIdentifiersFromResponse).toEqual(expect.arrayContaining(namesString));
    });     
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode without CountryCode', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getCountryCode(token, countryCodeNull);
    });

    
    await test.step(`CHECK response`, async () => {
      errorMessage = "Property 'countryCode' validation error. The field countryCode must be a string or array type with a maximum length of '2'.";   
      expect(userProfileResponse.error.status).toBe(400);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });

  test('Request /api/v1/normalized-data/country-data/:countryCode with valid code but no data', async ({ }) => {
    let errorMessage: string;    

      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCountryCode(token, countryCodeNoData);
      });

      await test.step(`CHECK response`, async () => {
        errorMessage = "There are no data for the country with the code '" + countryCodeNoData + "'.";
        expect(userProfileResponse.error.status).toBe(404);
        expect(userProfileResponse.error).toHaveProperty('data.Code', 404);
        expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
      });
  });
})

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
  
  test('/api/v1/normalized-data/country-data/:countryCode with token from user with role SMB Dashboard', async ({ }) => {
   let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCountryCode(token, countryCode[0]);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Access Denied.";
      expect(userProfileResponse.error.status).toBe(403);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 403);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });
})