// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
// Use https://www.npmjs.com/package/mime-types to convert extension to associated Content-Type
const mime = require('mime-types');
// Use https://github.com/markdown-it/markdown-it to convert markdown to html
const md = require('markdown-it')();
// Use https://www.npmjs.com/package/sharp to convert images
const sharp = require('sharp');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const supportedTypes = [
  'text/plain',
  'text/plain; charset=utf-8',
  `text/markdown`,
  `text/html`,
  `application/json`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`,
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
      throw new Error(`ownerId and type are required`);
    }
    if (!supportedTypes.includes(type)) {
      throw new Error(`type must be supported`);
    }
    if (typeof size != 'number' || size < 0) {
      throw new Error(`size must be a number and cannot be negative`);
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    try {
      const fragments = await listFragments(ownerId, expand);
      if (expand) {
        return fragments.map((fragment) => new Fragment(fragment));
      }
      return fragments;
    } catch (err) {
      throw new Error('Error listing fragments');
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    try {
      const data = await readFragment(ownerId, id);
      const fragment = new Fragment(data);
      return fragment;
    } catch (err) {
      throw new Error('Error extracting fragment');
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    try {
      return deleteFragment(ownerId, id);
    } catch (err) {
      throw new Error('Unable to delete fragment');
    }
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }
    this.size = Buffer.byteLength(data);
    this.save();
    return await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    let convertableTo;
    if (this.type.includes('text/plain')) {
      convertableTo = ['text/plain'];
    } else if (this.type.includes('text/markdown')) {
      convertableTo = ['text/markdown', 'text/html', 'text/plain'];
    } else if (this.type.includes('text/html')) {
      convertableTo = ['text/html', 'text/plain'];
    } else if (this.type.includes('application/json')) {
      convertableTo = ['application/json', 'text/plain'];
    } else if (
      this.type === 'image/png' ||
      this.type === 'image/jpeg' ||
      this.type === 'image/webp' ||
      this.type === 'image/gif'
    ) {
      convertableTo = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    }
    return convertableTo;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    return supportedTypes.includes(value);
  }

  /**
   * Returns converted data as well new type based on extension
   * @param {Buffer} data data to convert
   * @param {string} extension extension to covert to
   * @returns {Buffer, string} new converted data and new type
   */
  async convertTo(data, ext) {
    let newType = mime.lookup(ext);
    const convertableTypes = this.formats;
    if (!convertableTypes.includes(newType)) {
      return false;
    }

    let newData = data;
    if (this.mimeType != newType) {
      if (this.mimeType == 'text/markdown' && newType == 'text/html') {
        newData = md.render(data.toString());
        newData = Buffer.from(newData);
      }
      if (
        this.mimeType.startsWith('image') &&
        (newType == 'image/png' ||
          newType == 'image/jpeg' ||
          newType == 'image/webp' ||
          newType == 'image/gif')
      ) {
        newData = sharp(data).toFormat(newType.slice(6)).toBuffer();
      }
    }
    return { newData, newType };
  }
}

module.exports.Fragment = Fragment;
