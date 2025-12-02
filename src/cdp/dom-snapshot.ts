import { CaptureSnapshotResponse, T_DOMSnapshot } from '../third-party/types';

export async function captureDOMSnapshot(DOMSnapshot: T_DOMSnapshot): Promise<CaptureSnapshotResponse> {
    console.log('Capturing DOM snapshot...');
    const res = await DOMSnapshot.captureSnapshot({
        computedStyles: [],
        includePaintOrder: true,
    });

    return res;
}
