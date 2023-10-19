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
const invalidSubscriptionId = [null, '24102024-1b7b-4c65-8473-2696298da53']
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
let subscriptionId: string;
const qr = new MysqlQueries;

test.describe("API Portal. Check PUT endpoint", () => {

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

  test('Request /api/v1/webhooks/subscriptions/:subscriptionid with new only event name', async ({ apiUtils }) => {
    shouldSkipAfterEach = false
    currentFixture = apiUtils;
    const data = {
      event: eventNames[1]
    }

      await test.step(`SENDING a POST request for create new subscriptions`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
      });

      subscriptionId = userProfileResponse.data.id;
      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
        expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
      })    
      
    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await apiUtils.putWebhookSubscriptions(token, subscriptionId, data)
    });   

    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[1]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    })

    await test.step(`CHECK changed event in database`, async () => {
      response = await qr.getWebhookSubscriptionById(subscriptionId);
      const eventFromDataBase = response[0].Event;
      expect(eventFromDataBase).toBe(eventNames[1]);
    });
  });

  test('Request /api/v1/webhooks/subscriptions/:subscriptionid with new only CallbackUrl', async ({ apiUtils }) => {
    shouldSkipAfterEach = false
    currentFixture = apiUtils;
    const data = {
      callbackUrl: URL2
    }

      await test.step(`SENDING a POST request for create new subscriptions`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
      });

      subscriptionId = userProfileResponse.data.id;

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
        expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
      })    
      
    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await apiUtils.putWebhookSubscriptions(token, subscriptionId, data)
    });   
    
    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[1].callbackUrl);
    })

    await test.step(`CHECK changed event in database`, async () => {
      response = await qr.getWebhookSubscriptionById(subscriptionId);
      const callbackUrlFromDataBase = response[0].CallbackUrl;
      expect(callbackUrlFromDataBase).toBe(URL2);
    });
  })

  test('Request /api/v1/webhooks/subscriptions/:subscriptionid with new CallbackUrl and new EventName', async ({ apiUtils }) => {
    shouldSkipAfterEach = false;
    currentFixture = apiUtils;
    const data = {
      callbackUrl: URL2,
      event: eventNames[2]
    }

      await test.step(`SENDING a POST request for create new subscriptions`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
      });

      subscriptionId = userProfileResponse.data.id;

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
        expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
      })
      
    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await apiUtils.putWebhookSubscriptions(token, subscriptionId, data)
    });
    
    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[2]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[1].callbackUrl);
    })

    await test.step(`CHECK changed event in database`, async () => {
      response = await qr.getWebhookSubscriptionById(subscriptionId);
      const callbackUrlFromDataBase = response[0].CallbackUrl;
      const eventFromDataBase = response[0].Event;
      expect(callbackUrlFromDataBase).toBe(URL2);
      expect(eventFromDataBase).toBe(eventNames[2])
    });
  })

  test('Request /api/v1/webhooks/subscriptions/:subscriptionid with empty values', async ({ apiUtils }) => {
    shouldSkipAfterEach = false;
    currentFixture = apiUtils;      
    const data = {
      callbackUrl: invalidCallbackUrls[1],
      event: invalidEventNames[0]
    }

      await test.step(`SENDING a POST request for create new subscriptions`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[1]);
      });

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
        expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[1].callbackUrl);
      })     
      
    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await apiUtils.putWebhookSubscriptions(token, subscriptionId, data)
    });
    
    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.error.status).toBe(400);
    })
  })

  test('Request /api/v1/webhooks/subscriptions/:subscriptionid with invalid URLs and valid eventName', async ({ apiUtils }) => {
    shouldSkipAfterEach = false
    currentFixture = apiUtils;
    const data = {
      callbackUrl: invalidCallbackUrls[2],
      event: eventNames[0]
    }

      await test.step(`SENDING a POST request for create new subscriptions`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[1], validCallbackUrls[1]);
      });

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data).toHaveProperty('event', eventNames[1]);
        expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[1].callbackUrl);
      })
      
    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await apiUtils.putWebhookSubscriptions(token, subscriptionId, data)
      console.log(userProfileResponse)
    });
    
    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.error.status).toBe(400);
    })
  })

  test('Request /api/v1/webhooks/subscriptions/:subscriptionid with invalid eventName and valid callbackUrl', async ({ apiUtils }) => {
    shouldSkipAfterEach = false
    currentFixture = apiUtils;
    const data = {
      callbackUrl: validCallbackUrls[2],
      event: invalidEventNames[1]
    }

      await test.step(`SENDING a POST request for create new subscriptions`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[1], validCallbackUrls[1]);
      });      

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data).toHaveProperty('event', eventNames[1]);
        expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[1].callbackUrl);
      })     
      
    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await apiUtils.putWebhookSubscriptions(token, subscriptionId, data)
    });   
    
    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.error.status).toBe(400);
    })
  }) 

  test('Request /api/v1/webhooks/subscriptions/:subscriptionid with invalid subscriptionid', async ({ apiUtils }) => {
    shouldSkipAfterEach = false
    currentFixture = apiUtils;
    const data = {
      callbackUrl: URL2,
      event: eventNames[1]
    }

      await test.step(`SENDING a POST request for create new subscriptions`, async () => {
        userProfileResponse = await apiUtils.postWebhookSubscribeOnEvent(token, eventNames[1], validCallbackUrls[1]);
      });

      subscriptionId = userProfileResponse.data.id;

      await test.step(`CHECK response`, async () => {
        expect(userProfileResponse.status).toBe(200);
        expect(userProfileResponse.data).toHaveProperty('event', eventNames[1]);
        expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[1].callbackUrl);
      })  

    for (let i = 0; i < invalidSubscriptionId.length; i++) {
    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await apiUtils.putWebhookSubscriptions(token, invalidSubscriptionId[i], data)
      console.log(userProfileResponse)
    });   
    await test.step(`CHECK response`, async () => {
      expect(userProfileResponse.error.status).toBe(400);
    })}
  })

  test('Check response in request /api/v1/webhooks/subscriptions/:eventName with rights "Sys Admin" user', async ({ systemAdminUser }) => {
    shouldSkipAfterEach = false
    currentFixture = systemAdminUser;
    const data = {
      callbackUrl: URL2,
      event: eventNames[1]
    }
    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await systemAdminUser.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    });

    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await systemAdminUser.putWebhookSubscriptions(token, subscriptionId, data)
    });
  })

  test('Check response in request /api/v1/webhooks/subscriptions/:eventName with rights "FI Admin" user', async ({ fiAdminUser }) => {
    shouldSkipAfterEach = false
    currentFixture = fiAdminUser;
    const data = {
      callbackUrl: URL2,
      event: eventNames[1]
    }
    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await fiAdminUser.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    });

    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await fiAdminUser.putWebhookSubscriptions(token, subscriptionId, data)
    });
  })

  test('Check response in request /api/v1/webhooks/subscriptions/:eventName with rights "Global Admin" user', async ({ globalAdminUser }) => {
    shouldSkipAfterEach = false
    currentFixture = globalAdminUser;
    const data = {
      callbackUrl: URL2,
      event: eventNames[1]
    }
    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await globalAdminUser.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    });

    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await globalAdminUser.putWebhookSubscriptions(token, subscriptionId, data)
    });
  })

  test('Check response in request /api/v1/webhooks/subscriptions/:eventName with rights "Integration user" user', async ({ integrationsUser }) => {
    shouldSkipAfterEach = false
    currentFixture = integrationsUser;
    const data = {
      callbackUrl: URL2,
      event: eventNames[1]
    }
    await test.step(`SENDING the same request`, async () => {
      userProfileResponse = await integrationsUser.postWebhookSubscribeOnEvent(token, eventNames[0], validCallbackUrls[0]);
    });

    await test.step(`CHECK first response`, async () => {
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data).toHaveProperty('event', eventNames[0]);
      expect(userProfileResponse.data).toHaveProperty('callbackUrl', validCallbackUrls[0].callbackUrl);
    });

    await test.step(`SENDING a PUT request`, async () => {
      userProfileResponse = await integrationsUser.putWebhookSubscriptions(token, subscriptionId, data)
    });
  })  
});