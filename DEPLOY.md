
# 🚀 SparkAI Production Deployment Manual

## Vercel Deployment Steps

1. **Create Project**: Import your GitHub repository into Vercel.
2. **Framework Preset**: Choose `Other`.
3. **Build Settings**:
   - Build Command: (Leave Empty)
   - Output Directory: `.`
   - Install Command: (Leave Empty)
4. **Environment Variables**:
   - Add `API_KEY`: [Your Gemini API Key]
5. **Supabase Config**:
   - Ensure the URLs in `services/supabaseService.ts` match your project.
   - Ensure the Master Reset SQL has been run in the Supabase SQL Editor.

## Post-Deployment Checklist
- [ ] Verify "Cloud Production" status in the header.
- [ ] Test the "Speed Spark" matching logic.
- [ ] Verify E2EE encryption by checking `messages` table in Supabase (should be unreadable).
- [ ] Test Live AI coaching with microphone.
