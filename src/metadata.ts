export type MetadataValue = string | Buffer;

/**
 * A representation of the Metadata class in the grpc package
 */
export interface IMetadata {
	/**
	 * Sets the given value for the given key by replacing any other values
	 * associated with that key. Normalizes the key.
	 * @param key The key to whose value should be set.
	 * @param value The value to set. Must be a buffer if and only
	 *   if the normalized key ends with '-bin'.
	 */
	set(key: string, value: MetadataValue): void;

	/**
	 * Adds the given value for the given key by appending to a list of previous
	 * values associated with that key. Normalizes the key.
	 * @param key The key for which a new value should be appended.
	 * @param value The value to add. Must be a buffer if and only
	 *   if the normalized key ends with '-bin'.
	 */
	add(key: string, value: MetadataValue): void;

	/**
	 * Removes the given key and any associated values. Normalizes the key.
	 * @param key The key whose values should be removed.
	 */
	remove(key: string): void;

	/**
	 * Gets a list of all values associated with the key. Normalizes the key.
	 * @param key The key whose value should be retrieved.
	 * @return A list of values associated with the given key.
	 */
	get(key: string): MetadataValue[];

	/**
	 * Gets a plain object mapping each key to the first value associated with it.
	 * This reflects the most common way that people will want to see metadata.
	 * @return A key/value mapping of the metadata.
	 */
	getMap(): { [key: string]: MetadataValue };

	/**
	 * Clones the metadata object.
	 * @return The newly cloned object.
	 */
	clone(): IMetadata;

	/**
	 * Set options on the metadata object
	 * @param options Boolean options for the beginning of the call.
	 *   These options only have any effect when passed at the beginning of
	 *   a client request.
	 */
	setOptions(options: IMetadataOptions): void;
}

export interface IMetadataOptions {
	/* Signal that the request is idempotent. Defaults to false */
	idempotentRequest?: boolean;
	/* Signal that the call should not return UNAVAILABLE before it has
	 * started. Defaults to true. */
	waitForReady?: boolean;
	/* Signal that the call is cacheable. GRPC is free to use GET verb.
	 * Defaults to false */
	cacheableRequest?: boolean;
	/* Signal that the initial metadata should be corked. Defaults to false. */
	corked?: boolean;
}

/**
 * A simple class implementing very basic functionality that
 * mimics using the MetaData class from the grpc package.
 */
export default class Metadata implements IMetadata {
	// tslint:disable variable-name
	private _internal_repr: any = {};

	constructor(options?: IMetadataOptions) {
		this._internal_repr = {};
	}

	public set = (key: string, value: MetadataValue) => {
		this._internal_repr[key] = [value];
	};

	public add = (key: string, value: MetadataValue) => {
		if (!this._internal_repr[key]) {
			this._internal_repr[key] = [];
		}
		this._internal_repr[key].push(value);
	};

	public remove = (key: string) => {
		if (Object.prototype.hasOwnProperty.call(this._internal_repr, key)) {
			delete this._internal_repr[key];
		}
	};

	public get = (key: string) => {
		if (Object.prototype.hasOwnProperty.call(this._internal_repr, key)) {
			return this._internal_repr[key];
		} else {
			return [];
		}
	};

	public getMap = (): { [key: string]: MetadataValue } => {
		const result: any = {};
		Object.keys(this._internal_repr).forEach(key => {
			const values = this._internal_repr[key];
			if (values.length > 0) {
				result[key] = values[0];
			}
		});
		return result;
	};

	public clone = (): IMetadata => {
		// Not implemented
		return this;
	};

	/**
	 * Set options on the metadata object
	 * @param {Object} options Boolean options for the beginning of the call.
	 *     These options only have any effect when passed at the beginning of
	 *     a client request.
	 * @param {boolean=} [options.idempotentRequest=false] Signal that the request
	 *     is idempotent
	 * @param {boolean=} [options.waitForReady=true] Signal that the call should
	 *     not return UNAVAILABLE before it has started.
	 * @param {boolean=} [options.cacheableRequest=false] Signal that the call is
	 *     cacheable. GRPC is free to use GET verb.
	 * @param {boolean=} [options.corked=false] Signal that the initial metadata
	 *     should be corked.
	 */
	public setOptions(options: IMetadataOptions) {
		// Not implemented locally
	}
}
