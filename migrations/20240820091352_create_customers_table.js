/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('customers', function (table) {
        table.increments('id').primary();
        table.string('name').nullable();
        table.string('mobile').nullable();
        table.string('vat').nullable();
        table.integer('user_id').nullable();
        table.timestamps(true, true);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTable('customers');
};
