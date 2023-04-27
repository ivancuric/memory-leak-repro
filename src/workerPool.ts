export const INITIAL_WORKERS = 4;
const workers: Array<WorkerConstruct> = [];
let messageCount = 0;

type WorkerConstruct = {
  instance: Worker;
  idle: boolean;
};

for (let i = 0; i < INITIAL_WORKERS; i++) {
  workers[i] = {
    instance: new Worker(new URL("./worker.ts", import.meta.url)),
    idle: true,
  };
}

workers.forEach((worker) => {
  worker.instance.addEventListener("message", (e) => {
    worker.idle = true;

    if (workerController.callback) {
      workerController.callback(e);
    }
  });
});

type MessageCallback = (e: MessageEvent<any>) => void;

type WorkerController = {
  postMessage: (message: any, transferables?: Transferable[]) => void;
  workersBusy: () => boolean;
  getWorkerStatus: () => Array<boolean>;
  callback?: MessageCallback;
};

export const workerController: WorkerController = {
  postMessage: (message, transferables) => {
    let worker = workers[messageCount % INITIAL_WORKERS];

    // a little recursion, try with the next one
    if (!worker.idle) {
      messageCount++;
      workerController.postMessage(message, transferables);
      return;
    }

    worker.idle = false;
    worker.instance.postMessage(message, transferables ? transferables : []);

    messageCount++;
  },
  workersBusy() {
    return workers.every((worker) => !worker.idle);
  },
  getWorkerStatus() {
    return workers.map((worker) => worker.idle);
  },
};
