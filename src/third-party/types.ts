import CDP from 'chrome-remote-interface';

export type CaptureSnapshotResponse = Awaited<ReturnType<T_DOMSnapshot['captureSnapshot']>>;

export type T_Client = Awaited<ReturnType<typeof CDP>>;
export type T_Page = Awaited<ReturnType<typeof CDP>>['Page'];
export type T_Network = Awaited<ReturnType<typeof CDP>>['Network'];
export type T_DOM = Awaited<ReturnType<typeof CDP>>['DOM'];
export type T_DOMSnapshot = Awaited<ReturnType<typeof CDP>>['DOMSnapshot'];
export type T_Runtime = Awaited<ReturnType<typeof CDP>>['Runtime'];

export type T_Node = Awaited<ReturnType<T_DOM['describeNode']>>['node'];
