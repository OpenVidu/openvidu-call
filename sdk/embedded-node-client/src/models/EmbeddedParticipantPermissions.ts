/* tslint:disable */
/* eslint-disable */
/**
 * OpenVidu Embedded API
 * The OpenVidu Embedded API allows seamless integration of interactive video rooms into external applications via an iframe. This API provides endpoints to manage participants, generate secure access URLs, and configure session settings for an embedded experience. 
 *
 * The version of the OpenAPI document: v1
 * Contact: commercial@openvidu.io
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface EmbeddedParticipantPermissions
 */
export interface EmbeddedParticipantPermissions {
    /**
     * If true, the participant is allowed to record the room.
     * 
     * @type {boolean}
     * @memberof EmbeddedParticipantPermissions
     */
    canRecord?: boolean;
    /**
     * If true, the participant can send and receive chat messages during the room.
     * 
     * @type {boolean}
     * @memberof EmbeddedParticipantPermissions
     */
    canChat?: boolean;
}

/**
 * Check if a given object implements the EmbeddedParticipantPermissions interface.
 */
export function instanceOfEmbeddedParticipantPermissions(value: object): value is EmbeddedParticipantPermissions {
    return true;
}

export function EmbeddedParticipantPermissionsFromJSON(json: any): EmbeddedParticipantPermissions {
    return EmbeddedParticipantPermissionsFromJSONTyped(json, false);
}

export function EmbeddedParticipantPermissionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): EmbeddedParticipantPermissions {
    if (json == null) {
        return json;
    }
    return {
        
        'canRecord': json['canRecord'] == null ? undefined : json['canRecord'],
        'canChat': json['canChat'] == null ? undefined : json['canChat'],
    };
}

export function EmbeddedParticipantPermissionsToJSON(json: any): EmbeddedParticipantPermissions {
    return EmbeddedParticipantPermissionsToJSONTyped(json, false);
}

export function EmbeddedParticipantPermissionsToJSONTyped(value?: EmbeddedParticipantPermissions | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'canRecord': value['canRecord'],
        'canChat': value['canChat'],
    };
}

