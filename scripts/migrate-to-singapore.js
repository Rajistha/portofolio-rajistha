const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env.local not found.');
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

const newUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const newServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!newUrl || !newServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const OLD_SUPABASE_URL = 'https://guxvqtqujtsrxaokwtir.supabase.co';

console.log('====================================================');
console.log('🚀 SUPABASE SINGAPORE ASSETS & URL MIGRATION UTILITY');
console.log('====================================================');
console.log('Target Project URL:', newUrl);
console.log('Old Project URL:   ', OLD_SUPABASE_URL);

if (newUrl === OLD_SUPABASE_URL) {
  console.log('\n⚠️  Notice: .env.local is still pointing to the old Supabase instance.');
  console.log('Please create your new Singapore project first, update .env.local with the new credentials, and re-run this script.\n');
  process.exit(0);
}

const supabase = createClient(newUrl, newServiceKey);

async function runMigration() {
  console.log('\n[1/3] Verifying connection to new Singapore Supabase...');
  const { data: profileCheck, error: pErr } = await supabase.from('profile').select('id').limit(1);
  if (pErr) {
    console.error('❌ Connection or schema error:', pErr.message);
    console.error('💡 Please make sure you have executed `supabase/complete-migration-singapore.sql` in your new project SQL Editor first.');
    process.exit(1);
  }
  console.log('✅ Connection confirmed. Tables are active.');

  console.log('\n[2/3] Uploading backed-up images to new Storage buckets...');
  const baseBackupDir = path.resolve(__dirname, '../supabase/storage-backup');
  const buckets = ['avatars', 'project-images'];

  for (const bucket of buckets) {
    const bucketDir = path.join(baseBackupDir, bucket);
    if (!fs.existsSync(bucketDir)) {
      console.log(`⚠️  Directory ${bucketDir} does not exist, skipping.`);
      continue;
    }

    const files = fs.readdirSync(bucketDir);
    console.log(`Uploading ${files.length} files to bucket [${bucket}]...`);

    for (const filename of files) {
      const filePath = path.join(bucketDir, filename);
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.webp') contentType = 'image/webp';

      const { error: upErr } = await supabase.storage.from(bucket).upload(filename, fileBuffer, {
        contentType,
        upsert: true,
      });

      if (upErr) {
        console.error(`  ❌ Failed to upload ${filename}:`, upErr.message);
      } else {
        console.log(`  ✅ Uploaded: ${bucket}/${filename}`);
      }
    }
  }

  console.log('\n[3/3] Updating image URLs in database to point to Singapore server...');

  // Update profile avatar_url
  const { data: profiles } = await supabase.from('profile').select('id, avatar_url');
  if (profiles) {
    for (const p of profiles) {
      if (p.avatar_url && p.avatar_url.includes(OLD_SUPABASE_URL)) {
        const updatedAvatar = p.avatar_url.replace(OLD_SUPABASE_URL, newUrl);
        await supabase.from('profile').update({ avatar_url: updatedAvatar }).eq('id', p.id);
        console.log(`  ✅ Profile avatar URL updated to: ${updatedAvatar}`);
      }
    }
  }

  // Update projects image_url
  const { data: projects } = await supabase.from('projects').select('id, title, image_url');
  if (projects) {
    for (const proj of projects) {
      if (proj.image_url && proj.image_url.includes(OLD_SUPABASE_URL)) {
        const updatedImg = proj.image_url.replace(OLD_SUPABASE_URL, newUrl);
        await supabase.from('projects').update({ image_url: updatedImg }).eq('id', proj.id);
        console.log(`  ✅ Project [${proj.title}] image URL updated.`);
      }
    }
  }

  console.log('\n🎉 ====================================================');
  console.log('🎉 SINGAPORE DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('🎉 ====================================================');
}

runMigration().catch(err => {
  console.error('Unexpected migration failure:', err);
});
