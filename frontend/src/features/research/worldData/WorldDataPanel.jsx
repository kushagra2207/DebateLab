import { useResearchStore } from '../store/researchStore';
import IndicatorSearch from './IndicatorSearch';
import IndicatorDataForm from './IndicatorDataForm';
import DataTable from './DataTable';

export default function WorldDataPanel() {
  const selectedIndicator = useResearchStore((state) => state.selectedIndicator);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Search the World Bank's data on any subject, then look up the values for a country or region.
      </p>
      <IndicatorSearch />
      {selectedIndicator && <IndicatorDataForm />}
      <DataTable />
    </div>
  );
}
