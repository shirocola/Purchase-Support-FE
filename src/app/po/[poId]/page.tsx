import { PODetailPage } from '@/components/po/PODetailPage'

interface PageProps {
  params: Promise<{
    poId: string
  }>
}

export default async function PODetailRoute({ params }: PageProps) {
  const { poId } = await params
  return <PODetailPage poId={poId} />
}

export async function generateMetadata({ params }: PageProps) {
  const { poId } = await params
  return {
    title: `PO ${poId} - Purchase Support System`,
    description: `Purchase Order details for ${poId}`,
  }
}