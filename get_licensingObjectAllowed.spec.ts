import { test, expect } from '../../../fixtures/admin_fixture/dashboard-fixture';
import * as config from '../../../../playwright.config';
import { allure } from 'allure-playwright';
import { ApiUtils } from '../../../utils/api-utils';
import * as owner from "../../../utils/owners.json"

const apiUtils = new ApiUtils;

let token: any;
let responselicenseManager: any;
let responseLicensingObjectAllowed: any;
let licenseObject: string = 'DashboardV3';
let licenseObjectIncorrect: string = 'DashboardV5';
let licenseObjectEmpty: string = '';
let dashboardV3: string;

test.describe("API Portal. GET Link reqest @skip", () => {
  
    test.beforeEach(async ({page}) => {
        allure.owner(owner["Vladyslav Rishko"]);
        token = await page.evaluate(() => {
            return localStorage.getItem('token');
        });
    });
    
    test('Check 200 code', async () => {

        await test.step(`Sending a request`, async () => {
            responselicenseManager = await apiUtils.getlicenseManager();
            responseLicensingObjectAllowed = await apiUtils.getLicensingObjectAllowed(token, licenseObject);
        });

        await test.step(`Checking and parsing getlicenseManager`, async () => {

            expect(responselicenseManager.status).toBe(200);

            let planName:string;
            let functionalitiesData = null;
            for (const plan of responselicenseManager.data.plans) {
                if (plan.startDate) {
                    planName = plan.name;
                    break;
                }
            }

            const actualPlan = responselicenseManager.data.plans.find((plan: any) => plan.name === planName);
            if (actualPlan && Array.isArray(actualPlan.functionalities)) {
                functionalitiesData = actualPlan.functionalities;
            }

            const dashboardV3Object = functionalitiesData.find((item: any) => item.name === licenseObject);
            dashboardV3 = dashboardV3Object.startDate;
        });

        await test.step(`Check response`, async () => {
            expect(responseLicensingObjectAllowed.status).toBe(200);
            if (dashboardV3 != 'null') {
                expect(responseLicensingObjectAllowed.response?.data).toBe(true);
            } else {
                expect(responseLicensingObjectAllowed.response?.data).toBe(false);
            }
        });
    });

    test('Check incorrect license object, response = false', async ({ }) => {

        await test.step(`Sending a request`, async () => {
            responseLicensingObjectAllowed = await apiUtils.getLicensingObjectAllowed(token, licenseObjectIncorrect);
        });

        await test.step(`Check response`, async () => {
            expect(responseLicensingObjectAllowed.status).toBe(200);
            expect(responseLicensingObjectAllowed.response?.data).toBe(false);
        });
    });

    test('Check empty license object, 400 Bad request', async ({ }) => {

        await test.step(`Sending a request`, async () => {
            responseLicensingObjectAllowed = await apiUtils.getLicensingObjectAllowed(token, licenseObjectEmpty);
        });

        await test.step(`Check response`, async () => {
            expect(responseLicensingObjectAllowed.error.status).toBe(400);
            expect(responseLicensingObjectAllowed.error).toHaveProperty('data.Code', 400);
        });
    });
});