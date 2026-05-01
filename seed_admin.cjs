/**
 * Create admin user for product management dashboard
 * Run: node seed_admin.cjs
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
	const email = "admin@nepalstore.com";
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		console.log("Admin user already exists:", email);
		await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
		console.log("Updated role to ADMIN.");
		return;
	}
	const hashedPassword = await bcrypt.hash("NepalStore2026!", 12);
	await prisma.user.create({
		data: { email, name: "Admin", password: hashedPassword, role: "ADMIN" },
	});
	console.log("Created admin user:");
	console.log("  Email: admin@nepalstore.com");
	console.log("  Password: NepalStore2026!");
	console.log("  Role: ADMIN");
	console.log("  Access: https://nepal-store.onrender.com/admin");
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
