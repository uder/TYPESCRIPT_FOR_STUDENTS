class Observer {
  private handlers: ObeserverHandlers
  private isUnsubscribed: boolean
  public _unsubscribe?: () => void;

  constructor(handlers: ObeserverHandlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: RequestInterface) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: RequestInterface) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable {
  private _subscribe: (obs: Observer) => () => void

  constructor(subscribe: (obs: Observer) => () => void) {
    this._subscribe = subscribe;
  }

  static from(values: Array<RequestInterface>) {
    return new Observable((observer: Observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: ObeserverHandlers) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return ({
      unsubscribe() {
        observer.unsubscribe();
      }
    });
  }
}

const HTTP_POST_METHOD = 'POST';
const HTTP_GET_METHOD = 'GET';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;


interface UserMockInterface {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
}

const userMock = {
  name: 'User Name',
  age: 26,
  roles: [
    'user',
    'admin'
  ],
  createdAt: new Date(),
  isDeleated: false,
};

type Method = "GET" | "POST"
type HttpStatus = 200 | 500

interface RequestInterface {
  method: Method;
  host: string;
  path: string;
  body?: UserMockInterface;
  params: {
    id?: string
  }
}

const requestsMock: Array<RequestInterface> = [
  {
    method: HTTP_POST_METHOD,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

const handleRequest = (request: RequestInterface) => {
  // handling of request
  return {status: HTTP_STATUS_OK};
};
const handleError = (error: RequestInterface) => {
  // handling of error
  return {status: HTTP_STATUS_INTERNAL_SERVER_ERROR};
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

interface SubscriptionInterface {
  unsubscribe(): void;
}

interface ObeserverHandlers {
  next: (r: RequestInterface) => {status: number};
  error: (r: RequestInterface) => {status: number};
  complete: () => void;
}

const subscription: SubscriptionInterface = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
