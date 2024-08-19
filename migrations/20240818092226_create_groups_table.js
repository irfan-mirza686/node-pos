/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('groups', function (table) {
        table.increments('id'); // Primary Key, auto-incremented
        table.string('name').notNullable(); // User name
        table.timestamps(true, true); // created_at and updated_at
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('groups'); // Drop the groups table on rollback
};
