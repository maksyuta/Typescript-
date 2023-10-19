import { test, expect } from '@playwright/test';
import * as config from '../../../../playwright.config';
import { allure } from 'allure-playwright';
import { ApiUtils } from '../../../utils/api-utils';
import * as owner from "../../../utils/owners.json"
import { ApiPortalUtils } from '../../../api-method/api-portal/api-methods';


const TokenProperty = 'access_token';
const companyid = '5642cd24-fca6-4780-9408-b06cb413335f'
const notAvailableCompanyid = '529daf13-b8c2-4819-978e-f55945fc9bd5'
const invalidCompanyid = '5642cd244fca6-4780-9408-b06cb413335'

test.describe("API Portal. GET Company reqest @skip", () => {
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

  test('Request /api/v1/normalized-data/company/:companyid with valid companyid @skip', async ({ }) => {
   
    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiPortalUtils.getCompany(token, companyid);      
    });

    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data.id).toBe(companyid)
    });
  });

  test('Request /api/v1/normalized-data/companies/:companyid with another (not available in the test env.) companyid', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {      
        userProfileResponse = await apiPortalUtils.getCompany(token, notAvailableCompanyid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "There are no data for the company with the id '" + notAvailableCompanyid + "'.";
      expect(userProfileResponse.error.status).toBe(404);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 404);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });

  test('Request /api/v1/normalized-data/companies/:companyid with invalid companyid', async ({ }) => {
    let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCompany(token, invalidCompanyid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Property 'companyId' validation error. The value '" + invalidCompanyid + "' is not valid.";
      expect(userProfileResponse.error.status).toBe(400);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 400);
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
  
  test('Request /api/v1/normalized-data/companies/:companyid with token from user with role SMB Dashboard', async ({ }) => {
   let errorMessage: string;

    await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiPortalUtils.getCompany(token, companyid);
    });

    await test.step(`CHECK response`, async () => {
      errorMessage = "Access Denied.";
      expect(userProfileResponse.error.status).toBe(403);
      expect(userProfileResponse.error).toHaveProperty('data.Code', 403);
      expect(userProfileResponse.error).toHaveProperty('data.Message', errorMessage);
    });
  });
})