export interface User {
    email: string | undefined;
    password: string | undefined;
    name: string | undefined;
    phoneNumber: number | undefined;
    company: number | undefined;
    role: string | undefined
}

export interface Measurements {
    measurement: string | undefined;
    host: string | undefined;
    inclinometers: string | undefined;
}

export interface MonitoringProfileGroup {
    group: string | undefined;
    measurements: string | undefined;
    monitoringGroupId: number | undefined;
}

export interface MonitoringProfile {
    code: string | undefined;
    group: string | undefined;
    name: string | undefined;
    description: string | undefined;
    type: string | undefined;
    attachedImage: string | undefined;
    inclinometers: string | undefined;
    monitoringGroupId: number | undefined;
}

export interface ProfilePositionAdjustment {
    code: string | undefined;
    measurement: string | undefined;
    inc: string | undefined;
    type: string | undefined;
    positionAdjusted: boolean | undefined;
    monitoringGroupId: number | undefined;
}

export interface PointXY {
    positionX: number | undefined;
    positionY: number | undefined;
    profilePositionAdjustmentId: number | undefined;
}

export interface MarkerLatLng {
    lat: number | undefined;
    lng: number | undefined;
    profilePositionAdjustmentId: number | undefined;
}

export interface LineCrossSection {
    topX: number | undefined;
    topY: number | undefined;
    bottomX: number | undefined;
    bottomY: number | undefined;
    profilePositionAdjustmentId: number | undefined;
}