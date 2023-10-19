import * as config from '../../../../playwright.config';
import { allure } from 'allure-playwright';
import { ApiUtils } from '../../../utils/api-utils';
import * as owner from "../../../utils/owners.json"
import { MysqlQueries } from '../../../database/queries-mysql';
import { test, expect, token } from '../../../fixtures/api_login_fixture';

const eventNames = ["NormalizedData", "ReadyToUseData", "RawData"];
const invalidEventNames = [null, "RaData", "readytousedata"];
const URL1 = 'https://aqa_test1.com/';
const URL2 = 'https://aqa_test2.com/';
const URL3 = 'https://aqa_test3.com/';
const validCallbackUrls = [
  { "callbackUrl": 'https://aqa_test1.com/' },
  { "callbackUrl": 'https://aqa_test2.com/' },
  { "callbackUrl": 'https://aqa_test3.com/' }
];
const invalidCallbackUrls = [
  { "": "" },
  { "callbackUrl": "" },
  { "callbackUrl": "https:www.google.com/" },
  { "callbackUrl": "https:/www.google3.com/" }
];
const qr = new MysqlQueries;

test.describe("API Portal. Check POST endpoint", () => {

  let shouldSkipAfterEach = false;
  let response: any
  let userProfileResponse: any;
  let currentFixture: any;

  async function deleteAllWebhookSubscriptions(currentFixture: any, token: any) {
    let userProfileResponse;
    userProfileResponse = await currentFixture.getAllWebhookSubscriptions(token);
  
    if (userProfileResponse.status === 200) {
      const responseData = userProfileResponse.data;
      const ids = [];
      for (const item of responseData) {
        ids.push(item.id);
      }
  
      if (ids.length > 0) {
        for (const subscriptionId of ids) {
          const deleteResponse = await currentFixture.deleteWebhookSubscription(token, subscriptionId);
          expect(deleteResponse.status).toBe(200);
          const response = await qr.getWebhookSubscriptionById(subscriptionId);
          expect(response).toEqual([]);
        }
      }
    }
  }

  test.beforeEach(async () => { 
    allure.owner(owner["Serhiy Maksiuta"]);   
    await test.step(`Check if user have any subscriptions and then delete`, async () => {
      if (!shouldSkipAfterEach && currentFixture) {
        await test.step(`Delete all subscriptions`, async () => {
          await deleteAllWebhookSubscriptions(currentFixture, token);
        });
      }
    });
  }
  );

  test.afterEach(async () => {
    await test.step(`Check if user have any subscriptions and then delete`, async () => {
      if (!shouldSkipAfterEach && currentFixture) {
        await test.step(`Delete all subscriptions`, async () => {
          await deleteAllWebhookSubscriptions(currentFixture, token);
        });
      }
    });
  });

  test('Request /api/v1/webhooks/subscriptions/:eventName with all valid data', async ({ apiUtils }) => {
    shouldSkipAfterEach = false
    currentFixture = apiUtils;
    for (let i = 0; i < eventNames.length; i++) {
      const nameOfIvent = eventNames[i];
      const collbackUrl = validCallbackUrls[i];

      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, nameOfIvent, collbackUrl);
      });


      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data).toHaveProperty('event', nameOfIvent);
        expect(userProfileResponse.data).toHaveProperty('callbackUrl', collbackUrl.callbackUrl);
      })
    };

    await test.step(`CHECK added events to database`, async () => {
      response = await qr.getWebhookSubscriptionByCallbackUrl(URL1, URL2, URL3);
      const eventsFromDatabase = response.map((row: { event: string }) => row.event);
      expect(eventsFromDatabase).not.toHaveLength(0);
      for (let i = 0; i < eventsFromDatabase.length; i++) {
        expect(eventsFromDatabase).toEqual(expect.arrayContaining(eventNames));
      }
    });
  });

  test('Request /api/v1/webhooks/subscriptions/:eventName with invalid URLs and valid eventName', async ({ apiUtils }) => {
    shouldSkipAfterEach = true
    currentFixture = apiUtils;
    for (let i = 0; i < invalidCallbackUrls.length; i++) {

      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[0], invalidCallbackUrls[i]);
      });

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.error.status).toBe(400);
        expect(userProfileResponse.error.data.message).not.toBeNull();
      })
    };
  });

  test('Request /api/v1/webhooks/subscriptions/:eventName with invalid events and valid callbackUrl', async ({ apiUtils }) => {
    shouldSkipAfterEach = true
    currentFixture = apiUtils;
    for (let i = 0; i < invalidEventNames.length; i++) {

      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, invalidEventNames[i], validCallbackUrls[0]);
      });

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.error.status).toBe(400);
        expect(userProfileResponse.error.data.message).not.toBeNull();
      })
    };
  });

  test('Request /api/v1/webhooks/subscriptions/:eventName trying to send second time', async ({ apiUtils }) => {
    shouldSkipAfterEach = false
    currentFixture = apiUtils;

    await test.step(`SENDING a request`, async () => {
      userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    });

    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK second response`, async () => {
      expect(userProfileResponse.error.status).toBe(409);      
      expect(userProfileResponse.error.data.message).not.toBeNull();
    });
  });

  test('Request /api/v1/webhooks/subscriptions/:eventName with checking multiple callbackUrl', async ({ apiUtils }) => {
    shouldSkipAfterEach = false
    currentFixture = apiUtils;

    for (let i = 0; i < validCallbackUrls.length; i++) {

      await test.step(`SENDING a request`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[i]);
      });      

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
        expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[i].callbackUrl);
      })
    };

    await test.step(`Check database`, async () => {
      response = await qr.getWebhookSubscriptionByCallbackUrl(URL1, URL2, URL3);
      expect(response).toHaveLength(3)
    })

  });  

  test('Check response in request /api/v1/webhooks/subscriptions/:eventName with rights "Sys Admin" user', async ({ systemAdminUser }) => {
    shouldSkipAfterEach = false
    currentFixture = systemAdminUser;
    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await systemAdminUser.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    });
  })

  test('Check response in request /api/v1/webhooks/subscriptions/:eventName with rights "FI Admin" user', async ({ fiAdminUser }) => {
    shouldSkipAfterEach = false
    currentFixture = fiAdminUser;
    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await fiAdminUser.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    });
  })

  test('Check response in request /api/v1/webhooks/subscriptions/:eventName with rights "Global Admin" user', async ({ globalAdminUser }) => {
    shouldSkipAfterEach = false
    currentFixture = globalAdminUser;
    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await globalAdminUser.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    });
  })

  test('Check response in request /api/v1/webhooks/subscriptions/:eventName with rights "Integration user" user', async ({ integrationsUser }) => {
    shouldSkipAfterEach = false
    currentFixture = integrationsUser;
    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await integrationsUser.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    });
  })

  test('Check response in request /api/v1/webhooks/subscriptions/:eventName with rights "SMB Dashboard" user', async ({ smbDashboardUser }) => {
    shouldSkipAfterEach = true
    currentFixture = smbDashboardUser;
    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await smbDashboardUser.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.error.status).toBe(403);
    });
  })
  
});

