const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Create a new user
    async save() {
        try {
            const hashedPassword = await bcrypt.hash(this.password, 12);
            const [result] = await pool.execute(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [this.username, this.email, hashedPassword]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Find user by username
    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw error;
        }
    }

    // Get all users (for admin purposes)
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT id, username, email, created_at, updated_at FROM users ORDER BY created_at DESC'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Update user
    static async updateById(id, updateData) {
        try {
            const fields = [];
            const values = [];
            
            if (updateData.username) {
                fields.push('username = ?');
                values.push(updateData.username);
            }
            
            if (updateData.email) {
                fields.push('email = ?');
                values.push(updateData.email);
            }
            
            if (updateData.password) {
                const hashedPassword = await bcrypt.hash(updateData.password, 12);
                fields.push('password = ?');
                values.push(hashedPassword);
            }
            
            if (fields.length === 0) {
                throw new Error('No fields to update');
            }
            
            values.push(id);
            
            const [result] = await pool.execute(
                `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Delete user
    static async deleteById(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM users WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;