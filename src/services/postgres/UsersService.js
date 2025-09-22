const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const { nanoid } = require("nanoid");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UserServices {
    constructor() {
        this._pool = new Pool();
    }

    async addUser({ username, password, fullname }) {
        // TODO: Verifikasi username, pastikan belum terdaftar.
        await this.verifyNewUsername(username);
        
        const id = `user-${nanoid(16)}`;
        const hashedPw = await bcrypt.hash(password, 10);
        // TODO: Bila verifikasi lolos, maka masukkan user baru ke database.
        const query = {
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPw, fullname]
        };

        const result = await this._pool.query(query);

        if(!result.rows.length) {
            throw new InvariantError('User gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async verifyNewUsername(username) {
        const query = {
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username]
        }

        const result = await this._pool.query(query);

        if(result.rows.length > 0) {
            throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
        };
    }

    async getUserById(userId) {
        const query = {
            text: 'SELECT id, username, fullname FROM users WHERE id = $1',
            values: [userId]
        }

        const result = await this._pool.query(query);

        if(!result.rows.length) {
            throw new NotFoundError('User tidak ditemukan');
        }

        return result.rows[0];
    }

    async verifyUserCredential(username, password) {
        const query = {
            text: 'SELECT password FROM users WHERE username = $1',
            values: [username]
        }

        const result = await this._pool.query(query);

        if(!result.rows.length) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        const { id, password: hashedPw} = result.rows[0];

        const match = await bcrypt.compare(password, hashedPw);

        if(!match) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        return id;
    }

    async getUsersByUsername(username) {
        const query = {
            text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
            values: [`%${username}%`]
        }

        const result = await this._pool.query(query);

        return result.rows;
    }
}

module.exports = UserServices;