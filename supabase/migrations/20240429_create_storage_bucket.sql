-- Create a new storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true);

-- Enable RLS
alter table storage.objects enable row level security;

-- Set up storage policy to allow authenticated users to upload files
create policy "Allow authenticated users to upload files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documents');

-- Set up storage policy to allow authenticated users to read files
create policy "Allow authenticated users to read files"
on storage.objects for select
to authenticated
using (bucket_id = 'documents');

-- Set up storage policy to allow authenticated users to delete their own files
create policy "Allow authenticated users to delete files"
on storage.objects for delete
to authenticated
using (bucket_id = 'documents'); 