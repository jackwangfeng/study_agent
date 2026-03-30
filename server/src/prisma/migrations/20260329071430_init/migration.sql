-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "openid" TEXT NOT NULL,
    "user_type" TEXT NOT NULL DEFAULT 'student',
    "nickname" TEXT,
    "avatar" TEXT,
    "grade" INTEGER,
    "subjects" TEXT[],
    "exam_date" TIMESTAMP(3),
    "membership_level" TEXT NOT NULL DEFAULT 'free',
    "membership_expire_at" TIMESTAMP(3),
    "parent_openid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wrong_questions" (
    "id" TEXT NOT NULL,
    "openid" TEXT NOT NULL,
    "question_image" TEXT,
    "question_text" TEXT,
    "subject" TEXT,
    "knowledge_point" TEXT,
    "wrong_count" INTEGER NOT NULL DEFAULT 1,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'unmastered',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wrong_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "explanations" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "doubt" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "is_understood" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "explanations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_plans" (
    "id" TEXT NOT NULL,
    "openid" TEXT NOT NULL,
    "plan_date" TIMESTAMP(3) NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "tomato_count" INTEGER NOT NULL DEFAULT 0,
    "total_minutes" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_records" (
    "id" TEXT NOT NULL,
    "openid" TEXT NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL,
    "records" JSONB NOT NULL DEFAULT '[]',
    "emotion_status" TEXT,
    "emotion_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_child_relations" (
    "id" TEXT NOT NULL,
    "parent_openid" TEXT NOT NULL,
    "child_openid" TEXT NOT NULL,
    "relation" TEXT,
    "bind_code" TEXT,
    "bind_code_expire_at" TIMESTAMP(3),
    "notify_enabled" BOOLEAN NOT NULL DEFAULT true,
    "weekly_report_day" INTEGER NOT NULL DEFAULT 6,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_child_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_openid_key" ON "users"("openid");

-- CreateIndex
CREATE INDEX "wrong_questions_openid_idx" ON "wrong_questions"("openid");

-- CreateIndex
CREATE INDEX "wrong_questions_subject_idx" ON "wrong_questions"("subject");

-- CreateIndex
CREATE INDEX "wrong_questions_status_idx" ON "wrong_questions"("status");

-- CreateIndex
CREATE INDEX "daily_plans_openid_idx" ON "daily_plans"("openid");

-- CreateIndex
CREATE INDEX "daily_plans_plan_date_idx" ON "daily_plans"("plan_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_plans_openid_plan_date_key" ON "daily_plans"("openid", "plan_date");

-- CreateIndex
CREATE INDEX "study_records_openid_idx" ON "study_records"("openid");

-- CreateIndex
CREATE UNIQUE INDEX "study_records_openid_record_date_key" ON "study_records"("openid", "record_date");

-- CreateIndex
CREATE INDEX "parent_child_relations_parent_openid_idx" ON "parent_child_relations"("parent_openid");

-- CreateIndex
CREATE INDEX "parent_child_relations_child_openid_idx" ON "parent_child_relations"("child_openid");

-- CreateIndex
CREATE INDEX "parent_child_relations_bind_code_idx" ON "parent_child_relations"("bind_code");

-- CreateIndex
CREATE UNIQUE INDEX "parent_child_relations_parent_openid_child_openid_key" ON "parent_child_relations"("parent_openid", "child_openid");

-- AddForeignKey
ALTER TABLE "wrong_questions" ADD CONSTRAINT "wrong_questions_openid_fkey" FOREIGN KEY ("openid") REFERENCES "users"("openid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "explanations" ADD CONSTRAINT "explanations_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "wrong_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_openid_fkey" FOREIGN KEY ("openid") REFERENCES "users"("openid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_records" ADD CONSTRAINT "study_records_openid_fkey" FOREIGN KEY ("openid") REFERENCES "users"("openid") ON DELETE RESTRICT ON UPDATE CASCADE;
