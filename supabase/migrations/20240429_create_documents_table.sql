-- Enable the ltree extension for hierarchical data
create extension if not exists ltree;

create table documents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('file', 'folder')),
  parent_id uuid references documents(id),
  project_id uuid references projects(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null,
  path ltree not null,
  constraint unique_name_in_folder unique (parent_id, name, project_id)
);

-- Create index for faster tree operations
create index documents_path_idx on documents using gist (path);

-- Create index for faster parent lookups
create index documents_parent_id_idx on documents(parent_id);

-- Create index for faster project lookups
create index documents_project_id_idx on documents(project_id);

-- Add RLS policies
alter table documents enable row level security;

create policy "Users can view their own project documents"
  on documents for select
  using (
    auth.uid() = created_by
    or 
    exists (
      select 1 from projects
      where projects.id = documents.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert documents in their own projects"
  on documents for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = documents.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update their own project documents"
  on documents for update
  using (
    auth.uid() = created_by
    or 
    exists (
      select 1 from projects
      where projects.id = documents.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete their own project documents"
  on documents for delete
  using (
    auth.uid() = created_by
    or 
    exists (
      select 1 from projects
      where projects.id = documents.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_documents_updated_at
  before update on documents
  for each row
  execute function update_updated_at_column(); 