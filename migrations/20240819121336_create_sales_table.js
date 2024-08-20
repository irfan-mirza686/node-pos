/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.createTable('sales', function (table) {
        table.increments('id').primary();
        table.string('order_no').nullable().unique();
        table.string('transactions').nullable();
        table.string('salesLocation').nullable();
        table.string('vat_no').nullable();
        table.integer('customer_id').nullable();
        table.string('delivery').nullable();
        table.text('remkars', 'longtext').nullable();
        table.string('type').nullable();
        table.date('date').nullable();
        table.text('time').nullable();
        table.text('description', 'longtext').nullable();
        table.text('items','longtext').nullable();
        table.string('status').nullable().defaultTo('confirmed');
        table.float('net_with_vat').nullable();
        table.float('total').nullable();
        table.float('cashAmount').nullable();
        table.float('tender_amount').nullable();
        table.float('change_amount').nullable();
        table.integer('user_id').nullable();
        table.timestamps(true, true);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTable('sales');
};
