-- Create FAQ Field Group for Blogs/Posts
INSERT INTO acf_field_groups (uuid, title, group_key, description, active, settings, fields)
VALUES (
    UUID(),
    'FAQ System',
    'group_faq_system',
    'Enterprise FAQ section for blog posts and articles',
    1,
    '{"location_rules":[{"param":"post_type","operator":"==","value":"post"}],"presentation":{"style":"default","position":"normal","label_placement":"top","instruction_placement":"label"},"hide_on_screen":[],"show_in_rest":true,"active":true}',
    '[{"key":"field_faq_tab","name":"faq_section_tab","label":"FAQ Section","type":"tab","instructions":"","required":false,"settings":{"placement":"top","endpoint":true},"wrapper":{"width":"100%"}},{"key":"field_faq_items","name":"faq_items","label":"Frequently Asked Questions","type":"repeater","instructions":"Add enterprise-grade FAQs for this post.","required":false,"settings":{"layout":"table","buttonLabel":"Add New FAQ","min":0,"max":20},"wrapper":{"width":"100%"},"sub_fields":[{"key":"field_faq_question","name":"question","label":"Question","type":"text","instructions":"","required":true,"settings":{},"wrapper":{"width":"100%"}},{"key":"field_faq_answer","name":"answer","label":"Answer","type":"textarea","instructions":"","required":true,"settings":{},"wrapper":{"width":"100%"}}]}]'
);
