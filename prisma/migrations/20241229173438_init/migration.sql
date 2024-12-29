-- DropForeignKey
ALTER TABLE "links" DROP CONSTRAINT "links_userId_fkey";

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
