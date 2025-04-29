-- Create a new storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true);

-- Set up storage policy to allow authenticated users to upload files
create policy "Allow authenticated users to upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents' AND
  auth.uid() = (
    select created_by
    from documents
    where id::text = (regexp_match(name, '^[^/]+/([^/]+)/[^/]+$'))[1]
  )
);

-- Set up storage policy to allow authenticated users to read files
create policy "Allow authenticated users to read files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents' AND
  exists (
    select 1
    from documents d
    join projects p on d.project_id = p.id
    where 
      d.id::text = (regexp_match(name, '^[^/]+/([^/]+)/[^/]+$'))[1]
      and (p.user_id = auth.uid() or d.created_by = auth.uid())
  )
);

-- Set up storage policy to allow authenticated users to delete their own files
create policy "Allow authenticated users to delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documents' AND
  auth.uid() = (
    select created_by
    from documents
    where id::text = (regexp_match(name, '^[^/]+/([^/]+)/[^/]+$'))[1]
  )
); 