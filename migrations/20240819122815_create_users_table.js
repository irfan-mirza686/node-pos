/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary();
        table.integer('parentMemberUniqueID').nullable();
        table.integer('group_id').nullable();
        table.string('user_type').nullable();
        table.integer('parent_memberID').nullable();
        table.string('slug').nullable();
        table.string('have_cr').nullable();
        table.string('cr_documentID').nullable();
        table.string('document_number').nullable();
        table.string('fname').nullable();
        table.string('lname').nullable();
        table.string('email').nullable().unique();
        table.string('mobile').nullable();
        table.string('image').nullable();
        table.string('companyID').nullable();
        table.string('cr_number').nullable();
        table.string('cr_activity').nullable();
        table.string('company_name_eng').nullable();
        table.string('company_name_arabic').nullable();
        table.string('gcpGLNID').nullable();
        table.string('gln').nullable();
        table.date('gcp_expiry').nullable();
        table.string('password').nullable();
        table.string('code').nullable();
        table.string('status').nullable().defaultTo('active');
        table.integer('user_id').nullable();
        table.string('v2_token').nullable();
        table.timestamps(true, true);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTable('users');
};
