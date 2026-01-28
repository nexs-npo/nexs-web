import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  collections: {
    resolutions: collection({
      label: 'Resolutions (議案)',
      slugField: 'title',
      path: 'src/content/resolutions/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        id: fields.text({ label: 'Resolution ID', description: 'e.g. RES-2026-001' }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: '審議中 (Reviewing)', value: 'review' },
            { label: '可決 (Approved)', value: 'approved' },
            { label: '否決 (Rejected)', value: 'rejected' },
          ],
          defaultValue: 'review',
        }),
        proposer: fields.text({ label: 'Proposer', description: 'Name of the person who proposed this resolution' }),
        proposedAt: fields.date({ label: 'Proposed Date' }),
        content: fields.mdx({ label: 'Proposal Body' }),
        attachments: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', description: 'Display name for the attachment' }),
            file: fields.file({
              label: 'File',
              directory: 'public/files/governance',
              publicPath: '/files/governance/',
            }),
          }),
          { label: 'Attachments', itemLabel: (props) => props.fields.label.value || 'Attachment' }
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
            summary: fields.text({ label: 'Summary', description: 'Brief title of the discussion' }),
            detail: fields.text({ label: 'Detail', multiline: true, description: 'Detailed description of the discussion' }),
          }),
          { label: 'Process Logs', itemLabel: (props) => props.fields.summary.value || 'Log Entry' }
        ),
        resolutionText: fields.text({
          label: 'Final Resolution',
          multiline: true,
          description: 'The final resolution text that will be formally adopted',
        }),
        approvals: fields.array(
          fields.object({
            name: fields.text({ label: 'Approver Name' }),
            date: fields.datetime({ label: 'Signed At' }),
          }),
          { label: 'Approvals / Signatures', itemLabel: (props) => props.fields.name.value || 'Approval' }
        ),
      },
    }),
  },
});
