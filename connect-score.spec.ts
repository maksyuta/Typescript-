import { test, expect } from '../../../fixtures/modules_fixtures/credit_score_fixtures/connect-score-fixture';
import { allure } from 'allure-playwright';
import * as owner from "../../../utils/owners.json"
import * as data from "../../../utils/credentials.json"
import { StorybookModulesEnum } from '../../../utils/enums';
import { STORYBOOK_CREDENTIALS } from '../../../../playwright.config';


test.skip('Check work Credit Score component (valid request) @webcomponents', () => {
        
    const nameCompany = 'Apple';
    const cityName = 'Cupertino';
    const zipCode = '95014';
    const state = 'Alabama';
    const noValidCompanyName = 'QQQQQQQQQ';
    const linkPrivacyPolicyCreditSafe = 'https://www.creditsafe.com/us/en/product/privacy/privacy-policy.html';
    const linkTermsCreditSafe = 'https://www.creditsafe.com/gb/en/legal/terms-and-conditions.html';

    test.beforeEach(async ({ creditScoreParams }) => {
        allure.owner(owner['Serhiy Maksiuta']);
        await creditScoreParams.setSettingsPage(StorybookModulesEnum.creditScore, STORYBOOK_CREDENTIALS.creditScoreApi,
            STORYBOOK_CREDENTIALS.creditScoreIdEmptyEmail, STORYBOOK_CREDENTIALS.creditScoreIdEmptyId);
        await expect(creditScoreParams.connectScorePage.moduleCreditScoreButton).toBeVisible();
    })

    test("Check work accessibility", async ({ storybookParams }) => {
        await test.step(`THEN I check and saw that accessibility has zero violations`, async () => {
            expect(await storybookParams.storybookPage.checkAccessibility()).toBeTruthy();
        })
    })

    test("Connect score and then disconnect", async ({ creditScoreParams }) => {
        test.slow();

        creditScoreParams.connectScorePage.disconnectScoreIfConnect();

        await test.step('Check button `Connect Score` in emptystate', async () => {
            await expect(creditScoreParams.connectScorePage.getScoreButton).toBeVisible();
        })

        await test.step('Check disabled `three dots` button', async () => {
            await expect(creditScoreParams.connectScorePage.threeDotsButton).toBeDisabled();
        })

        await test.step('Click button `Connect Score` and check screen  with describe', async () => {
            await creditScoreParams.connectScorePage.getScoreButton.click();
            await expect(creditScoreParams.connectScorePage.titleHowDoesItWork).toBeVisible();
        });

        await test.step('Click button `Next` and check displayed page for find company', async () => {
            await creditScoreParams.connectScorePage.nextButton.click();
            await expect(creditScoreParams.connectScorePage.titleSearchCompany).toBeVisible();
        })

        await test.step('Fill data in all fields for find company', async () => {
            await creditScoreParams.connectScorePage.findCompany(nameCompany, cityName, state, zipCode);
        })

        await test.step(`Choose company from list and finish connected`, async () => {
            await creditScoreParams.connectScorePage.selectCompany.click();
            await creditScoreParams.connectScorePage.nextButton.click();
        })

        await test.step('Check Credit Score is connected', async () => {
            await expect(creditScoreParams.connectScorePage.creditScoreGraph).toBeVisible({ timeout: 45000 });
        })

        await test.step(`Disconnect credit bureau`, async () => {
            await creditScoreParams.connectScorePage.threeDotsButton.click();
            await creditScoreParams.connectScorePage.disconnectBureauButton.click();
            await creditScoreParams.connectScorePage.stopMonitoringButton.click();
        })

        await test.step('Check empty state page after disconnect', async () => {
            await expect(creditScoreParams.connectScorePage.getScoreButton).toBeVisible();
        })
    })

    test.describe('Check flow connection score', () => {

        test.beforeEach(async ({ connectScorePage }) => {
            connectScorePage;
        })

        test("Check button `Next` is diactivated if data not filled", async ({ connectScorePage }) => {            

            await test.step('Check diactivated button `Next`', async () => {
                await expect(connectScorePage.nextButton).toBeDisabled();
                
            })
        })

        test("Check info screen if company not find", async ({ connectScorePage }) => {
            await test.step('Fill data for search not valid company', async () => {
                await connectScorePage.findCompany(noValidCompanyName, cityName, state, zipCode);
            })

            await test.step('Check displaying buttons `Close`, `Change Info` and title', async () => {
                await expect(connectScorePage.titleNoResult).toBeVisible();
                await expect(connectScorePage.buttonEditInfoInOopsPage).toBeVisible();
                await expect(connectScorePage.buttonClose).toBeVisible();
            })
        })

        test("Check `Change info` button in the page `No result`", async ({ connectScorePage }) => {
            await test.step('Fill data for search not valid company', async () => {
                await connectScorePage.findCompany(noValidCompanyName, cityName, state, zipCode);
            })

            await test.step('Click button `Edit info`', async () => {              
                await connectScorePage.buttonEditInfoInOopsPage.click();
            })

            await test.step('Check displayed entered data in all fields', async () => {
                await expect(connectScorePage.companyField).toHaveValue(noValidCompanyName);
                await expect(connectScorePage.cityField).toHaveValue(cityName);               
                //await expect(connectScorePage.chosenState).toHaveValue(state);
                await expect(connectScorePage.zipCodeField).toHaveValue(zipCode);
            })
        })

        test("Check `Close` button in the page `No result`", async ({ connectScorePage }) => {
            await test.step('Fill data for search not valid company', async () => {
                await connectScorePage.findCompany(noValidCompanyName, cityName, state, zipCode);
            })

            await test.step('Click button `Close`', async () => {
                await connectScorePage.buttonClose.click();
            })

            await test.step('Check empty state page displayed', async () => {
                await expect(connectScorePage.getScoreButton).toBeVisible();
            })
        })

        test("Check the button Back", async ({ connectScorePage }) => {
            await test.step('Fill data in all fields for find company', async () => {
                await connectScorePage.findCompany(nameCompany, cityName, state, zipCode);
            })

            await test.step('Click button `Back` from list of companies', async () => {
                await connectScorePage.buttonEditInfo.click();
            })

            await test.step('Check displayed page for find company', async () => {
                await expect(connectScorePage.titleSearchCompany).toBeVisible();
            })

            await test.step('Click button `Back` from page from search company', async () => {
                await connectScorePage.buttonBack.click();
            })

            await test.step('Check info screen `How does it works`', async () => {
                await expect(connectScorePage.titleHowDoesItWork).toBeVisible();
            })

            await test.step('Click button `Back` from screen `How does it works`', async () => {
                await connectScorePage.buttonBack.click();
            })

            await test.step('Check empty state page ', async () => {
                await expect(connectScorePage.getScoreButton).toBeVisible();
            })
        })

        test("Check `Credit Safe` Privacy Policy in connect score flow", async ({ connectScorePage }) => {
            await test.step('Fill data in all fields for find company', async () => {
                await connectScorePage.findCompany(nameCompany, cityName, state, zipCode);
            })

            await test.step('Open pop-up with Terms of use', async () => {
                await connectScorePage.buttonPrivacyCreditSafe.click();
            })

            await test.step('Check that the link is correct', async () => {
                const hrefValueTerms = await connectScorePage.linkPrivacyCreditSafe.getAttribute('href');
                expect(hrefValueTerms).toMatch(linkPrivacyPolicyCreditSafe);
            })

            await test.step('Close pop-up', async () => {
                await connectScorePage.buttonCrossPopup.click();
            })

            await test.step('Check pop-up is closed and displayed page with companies list', async () => {
                await expect(connectScorePage.titleChooseYourCompany).toBeVisible();
            })
        })

        test("Check `Credit Safe` Terms of use in connect score flow", async ({ connectScorePage }) => {
            await test.step('Fill data in all fields for find company', async () => {
                await connectScorePage.findCompany(nameCompany, cityName, state, zipCode);
            })

            await test.step('Open pop-up with Terms of use', async () => {
                await connectScorePage.buttonTermsCreditSafe.click();
            })

            await test.step('Check that the link is correct', async () => {
                const hrefValueTerms = await connectScorePage.linkTermsOfUseCreditSafe.getAttribute('href');
                expect(hrefValueTerms).toMatch(linkTermsCreditSafe);
            })

            await test.step('Close pop-up', async () => {
                await connectScorePage.buttonCrossPopup.click();
            })

            await test.step('Check pop-up is closed and displayed page with companies list', async () => {
                await expect(connectScorePage.titleChooseYourCompany).toBeVisible();
            })
        })
    })
})