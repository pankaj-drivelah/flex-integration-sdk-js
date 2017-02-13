import { UUID, LatLng } from './types';
import fake from './fake';
import SharetribeSdk from './sdk';
import memoryStore from './memory_store';

describe('new SharetribeSdk', () => {
  it('creates a new instance with given options', () => {
    const tokenStore = {};

    const inst = new SharetribeSdk({
      baseUrl: 'https://jsonplaceholder.typicode.com',
      clientId: '08ec69f6-d37e-414d-83eb-324e94afddf0',
      typeHandlers: [],
      endpoints: [],
      adapter: null,
      tokenStore,
    });

    expect(inst.config).toEqual(expect.objectContaining({
      baseUrl: 'https://jsonplaceholder.typicode.com',
      clientId: '08ec69f6-d37e-414d-83eb-324e94afddf0',
      tokenStore,
    }));
  });

  it('validates presence of clientId', () => {
    expect(() => new SharetribeSdk({
      baseUrl: 'https://jsonplaceholder.typicode.com',
    })).toThrowError('clientId must be provided');
  });

  it('creates new endpoints', () => {
    const inst = new SharetribeSdk({
      clientId: '08ec69f6-d37e-414d-83eb-324e94afddf0',
      typeHandlers: [],
      endpoints: [{
        path: 'posts/showAll',
      }],
      adapter: null,
      tokenStore: memoryStore(),
    });

    expect(inst.posts.showAll).toBeInstanceOf(Function);
  });

  it('calls users endpoint with query params', () => {
    const inst = new SharetribeSdk({
      baseUrl: '',
      clientId: '08ec69f6-d37e-414d-83eb-324e94afddf0',
      typeHandlers: [],
      endpoints: [],
      adapter: fake,
      tokenStore: memoryStore(),
    });

    return inst.users.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then((res) => {
      const resource = res.data.data;
      const attrs = resource.attributes;

      expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(expect.objectContaining({
        email: 'user@sharetribe.com',
        description: 'A team member',
      }));
    });
  });

  it('calls marketplace endpoint with query params', () => {
    const inst = new SharetribeSdk({
      baseUrl: '',
      clientId: '08ec69f6-d37e-414d-83eb-324e94afddf0',
      typeHandlers: [],
      endpoints: [],
      adapter: fake,
      tokenStore: memoryStore(),
    });

    return inst.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then((res) => {
      const resource = res.data.data;
      const attrs = resource.attributes;

      expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(expect.objectContaining({
        name: 'Awesome skies.',
        description: 'Meet and greet with fanatical sky divers.',
      }));
    });
  });

  it('calls listing search with query params', () => {
    const inst = new SharetribeSdk({
      baseUrl: '',
      clientId: '08ec69f6-d37e-414d-83eb-324e94afddf0',
      typeHandlers: [],
      endpoints: [],
      adapter: fake,
      tokenStore: memoryStore(),
    });

    return inst.listings.search({ id: new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'), origin: new LatLng(40.00, -70.00) }).then((res) => {
      const data = res.data.data;

      expect(data.length).toEqual(2);
      expect(data[0].attributes.description).toEqual('27-speed Hybrid. Fully functional.');
      expect(data[0].attributes.geolocation instanceof LatLng).toEqual(true);
      expect(data[0].attributes.geolocation).toEqual(new LatLng(40.64542, -74.08508));
      expect(data[1].attributes.description).toEqual('Goes together perfectly with a latte and a bow tie.');
      expect(data[1].attributes.geolocation instanceof LatLng).toEqual(true);
      expect(data[1].attributes.geolocation).toEqual(new LatLng(40.64542, -74.08508));
    });
  });

  it('allows user to pass custom read/write handlers', () => {
    class MyUuid {
      constructor(uuid) {
        this.myUuid = uuid;
      }
    }

    const handlers = [{
      type: UUID,
      customType: MyUuid,
      reader: v => new MyUuid(v.uuid), // reader fn type: UUID -> MyUuid
      writer: v => new UUID(v.myUuid), // writer fn type: MyUuid -> UUID
    }];

    const inst = new SharetribeSdk({
      baseUrl: '',
      clientId: '08ec69f6-d37e-414d-83eb-324e94afddf0',
      endpoints: [],
      adapter: fake,
      typeHandlers: handlers,
      tokenStore: memoryStore(),
    });

    return inst.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then((res) => {
      const resource = res.data.data;
      const attrs = resource.attributes;

      expect(resource.id).toEqual(new MyUuid('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(expect.objectContaining({
        name: 'Awesome skies.',
        description: 'Meet and greet with fanatical sky divers.',
      }));
    });
  });

  it('reads auth token from store and includes it in request headers', () => {
    const inst = new SharetribeSdk({
      baseUrl: '',

      // The Fake server doesn't know this clientId. However, the request passes because
      // the access_token is in the store
      clientId: 'daaf8871-4723-45b8-bc97-9e335f46966d',

      endpoints: [],
      adapter: fake,
      tokenStore: {
        getToken: () => ({
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYXJrZXRwbGFjZS1pZCI6IjE2YzZhNGI4LTg4ZWUtNDI5Yi04MzVhLTY3MjUyMDZjZDA4YyIsImNsaWVudC1pZCI6IjA4ZWM2OWY2LWQzN2UtNDE0ZC04M2ViLTMyNGU5NGFmZGRmMCIsInRlbmFuY3ktaWQiOiIxNmM2YTRiOC04OGVlLTQyOWItODM1YS02NzI1MjA2Y2QwOGMiLCJzY29wZSI6InB1YmxpYy1yZWFkIiwiZXhwIjoxNDg2NDcwNDg3fQ.6l_rV-hLbod-lfakhQTNxF7yY-4SEtaVGIPq2pO_2zo',
          token_type: 'bearer',
        }),
      },
    });

    return inst.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then((res) => {
      const resource = res.data.data;
      const attrs = resource.attributes;

      expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(expect.objectContaining({
        name: 'Awesome skies.',
        description: 'Meet and greet with fanatical sky divers.',
      }));
    });
  });

  it('stored the auth token to the store', () => {
    class TokenStore {
      getToken() {
        return this.token;
      }
      setToken(token) {
        this.token = token;
      }
    }

    const tokenStore = new TokenStore();

    const inst = new SharetribeSdk({
      baseUrl: '',
      clientId: '08ec69f6-d37e-414d-83eb-324e94afddf0',
      endpoints: [],
      adapter: fake,
      tokenStore,
    });

    return inst.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then((res) => {
      const resource = res.data.data;
      const attrs = resource.attributes;
      const token = tokenStore.getToken();

      expect(resource.id).toEqual(new UUID('0e0b60fe-d9a2-11e6-bf26-cec0c932ce01'));
      expect(attrs).toEqual(expect.objectContaining({
        name: 'Awesome skies.',
        description: 'Meet and greet with fanatical sky divers.',
      }));

      expect(token.access_token).toEqual('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYXJrZXRwbGFjZS1pZCI6IjE2YzZhNGI4LTg4ZWUtNDI5Yi04MzVhLTY3MjUyMDZjZDA4YyIsImNsaWVudC1pZCI6IjA4ZWM2OWY2LWQzN2UtNDE0ZC04M2ViLTMyNGU5NGFmZGRmMCIsInRlbmFuY3ktaWQiOiIxNmM2YTRiOC04OGVlLTQyOWItODM1YS02NzI1MjA2Y2QwOGMiLCJzY29wZSI6InB1YmxpYy1yZWFkIiwiZXhwIjoxNDg2NDcwNDg3fQ.6l_rV-hLbod-lfakhQTNxF7yY-4SEtaVGIPq2pO_2zo');
      expect(token.token_type).toEqual('bearer');
      expect(token.expires_in).toEqual(86400);
    });
  });

  it('stores auth token after login', () => {
    class TokenStore {
      getToken() {
        return this.token;
      }
      setToken(token) {
        this.token = token;
      }
    }

    const tokenStore = new TokenStore();

    const sdk = new SharetribeSdk({
      baseUrl: '',
      clientId: '08ec69f6-d37e-414d-83eb-324e94afddf0',
      endpoints: [],
      adapter: fake,
      tokenStore,
    });

    // First we get the anonymous token
    return sdk.marketplace.show({ id: '0e0b60fe-d9a2-11e6-bf26-cec0c932ce01' }).then(() => {
      expect(tokenStore.getToken().access_token).toEqual('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYXJrZXRwbGFjZS1pZCI6IjE2YzZhNGI4LTg4ZWUtNDI5Yi04MzVhLTY3MjUyMDZjZDA4YyIsImNsaWVudC1pZCI6IjA4ZWM2OWY2LWQzN2UtNDE0ZC04M2ViLTMyNGU5NGFmZGRmMCIsInRlbmFuY3ktaWQiOiIxNmM2YTRiOC04OGVlLTQyOWItODM1YS02NzI1MjA2Y2QwOGMiLCJzY29wZSI6InB1YmxpYy1yZWFkIiwiZXhwIjoxNDg2NDcwNDg3fQ.6l_rV-hLbod-lfakhQTNxF7yY-4SEtaVGIPq2pO_2zo');

      // After login, the anonymous token will be overriden
      return sdk.login({ username: 'joe.dunphy@example.com', password: 'secret-joe' }).then(() => {
        expect(tokenStore.getToken().access_token).toEqual('dyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYXJrZXRwbGFjZS1pZCI6IjE2YzZhNGI4LTg4ZWUtNDI5Yi04MzVhLTY3MjUyMDZjZDA4YyIsImNsaWVudC1pZCI6IjA4ZWM2OWY2LWQzN2UtNDE0ZC04M2ViLTMyNGU5NGFmZGRmMCIsInRlbmFuY3ktaWQiOiIxNmM2YTRiOC04OGVlLTQyOWItODM1YS02NzI1MjA2Y2QwOGMiLCJzY29wZSI6InVzZXIiLCJleHAiOjE0ODY2NTY1NzEsInVzZXItaWQiOiIzYzA3M2ZhZS02MTcyLTRlNzUtOGI5Mi1mNTYwZDU4Y2Q0N2MifQ.XdRyKz6_Nc6QJDGZIZ7URdOz7V3tBCkD9olRTYIBL44');
      });
    });
  });
});