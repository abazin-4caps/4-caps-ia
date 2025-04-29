-- Créer le bucket pour les documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true);

-- Autoriser l'accès public aux fichiers
create policy "Documents are publicly accessible"
on storage.objects for select
using ( bucket_id = 'documents' );

-- Autoriser l'upload pour les utilisateurs authentifiés
create policy "Users can upload documents"
on storage.objects for insert
with check (
  bucket_id = 'documents'
  and auth.role() = 'authenticated'
);

-- Autoriser la suppression pour les propriétaires
create policy "Users can delete their own documents"
on storage.objects for delete
using (
  bucket_id = 'documents'
  and auth.uid() = owner
); 