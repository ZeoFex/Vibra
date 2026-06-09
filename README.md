### Phase 3 — AWS production *(planned)*
- [ ] Deploy Next.js on AWS (Amplify, ECS, or EC2)
- [ ] S3 buckets for audio and static assets
- [ ] Lambda / MediaConvert for audio transcoding (multiple bitrates)
- [ ] SQS for async upload processing and moderation jobs
- [ ] ElastiCache Redis for sessions and rate limiting
- [ ] Route 53 + CloudFront for global delivery
- [ ] AWS IAM, Secrets Manager, and CloudWatch monitoring
### Phase 4 — Platform maturity
- [ ] Automated content moderation (lyrics + audio screening)
- [ ] Admin music review backed by real database state
- [ ] Artist analytics from real play/download events
- [ ] OAuth (Google, Apple) sign-in
- [ ] Native mobile apps
---
## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to Neon |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run lint` | Run ESLint |
---
## License
Private — ZeoFex / Vibra. All rights reserved.
---
<p align="center">
  <strong>Vibra</strong> — Feel Every Beat<br/>
  Built with Next.js · Neon · Cloudinary · AWS (coming)
</p>
