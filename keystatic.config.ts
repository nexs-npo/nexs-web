import { collection, config, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'nexs-npo/nexs-web',
    branchPrefix: 'proposal/',
  },
  collections: {
    journal: collection({
      label: 'Journal (活動日誌)',
      slugField: 'title',
      path: 'src/content/journal/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({
          label: 'Date',
          defaultValue: { kind: 'today' },
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'nexs Research',
        }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          description: 'Brief summary of the journal entry',
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
    announcements: collection({
      label: 'Announcements (お知らせ)',
      slugField: 'title',
      path: 'src/content/announcements/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({
          label: 'Date',
          defaultValue: { kind: 'today' },
        }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'News (一般)', value: 'news' },
            { label: 'Event (イベント)', value: 'event' },
            { label: 'Update (更新)', value: 'update' },
            { label: 'Important (重要)', value: 'important' },
          ],
          defaultValue: 'news',
        }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          description: 'Brief summary of the announcement',
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
    'resolution-materials': collection({
      label: 'Resolution Materials (参考資料)',
      slugField: 'title',
      path: 'src/content/resolution-materials/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        resolutionId: fields.text({
          label: 'Resolution ID',
          description: 'e.g. RES-2026-001',
        }),
        date: fields.date({
          label: 'Date',
          defaultValue: { kind: 'today' },
        }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Background (背景)', value: 'background' },
            { label: 'Data (データ)', value: 'data' },
            { label: 'Proposal (提案)', value: 'proposal' },
            { label: 'Reference (参考)', value: 'reference' },
          ],
          defaultValue: 'reference',
        }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          description: 'Brief summary of the material',
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
    resolutions: collection({
      label: 'Resolutions (議案)',
      slugField: 'title',
      path: 'src/content/resolutions/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        id: fields.text({
          label: 'Resolution ID',
          description: 'e.g. RES-2026-001',
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: '審議中 (Reviewing)', value: 'review' },
            { label: '可決 (Approved)', value: 'approved' },
            { label: '否決 (Rejected)', value: 'rejected' },
          ],
          defaultValue: 'review',
        }),
        proposer: fields.text({
          label: 'Proposer',
          description: 'Name of the person who proposed this resolution',
        }),
        proposedAt: fields.date({ label: 'Proposed Date' }),
        content: fields.mdx({ label: 'Proposal Body' }),
        attachments: fields.array(
          fields.object({
            label: fields.text({
              label: 'Label',
              description: 'Display name for the attachment',
            }),
            file: fields.file({
              label: 'File',
              directory: 'public/files/governance',
              publicPath: '/files/governance/',
            }),
          }),
          {
            label: 'Attachments',
            itemLabel: (props) => props.fields.label.value || 'Attachment',
          },
        ),
        discussionLogs: fields.array(
          fields.object({
            date: fields.datetime({ label: 'Date & Time' }),
            type: fields.select({
              label: 'Type',
              options: [
                { label: 'Slack', value: 'slack' },
                { label: 'Github PR', value: 'github' },
                { label: 'Meeting', value: 'meeting' },
              ],
              defaultValue: 'slack',
            }),
            summary: fields.text({
              label: 'Summary',
              description: 'Brief title of the discussion',
            }),
            detail: fields.text({
              label: 'Detail',
              multiline: true,
              description: 'Detailed description of the discussion',
            }),
          }),
          {
            label: 'Process Logs',
            itemLabel: (props) => props.fields.summary.value || 'Log Entry',
          },
        ),
        resolutionText: fields.text({
          label: 'Final Resolution',
          multiline: true,
          description:
            'The final resolution text that will be formally adopted',
        }),
        approvals: fields.array(
          fields.object({
            approved: fields.checkbox({
              label: '承認する',
              defaultValue: true,
            }),
            date: fields.date({ label: '確認日' }),
          }),
          {
            label: 'Approvals / Signatures',
            itemLabel: (props) => {
              const date = props.fields.date.value;
              return date ? `承認済み - ${date}` : '承認';
            },
          },
        ),
      },
    }),
  },
});
