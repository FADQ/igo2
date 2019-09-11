import { EntityRecord } from '@igo2/common';
import { Feature, FeatureStore, IgoMap, moveToOlFeatures } from '@igo2/geo';

export function zoomToFeatureStore(map: IgoMap, store: FeatureStore) {
  const selectedFeatures = store.stateView
    .manyBy((record: EntityRecord<Feature>) => record.state.selected === true)
    .map((record: EntityRecord<Feature>) => record.entity);

    if (selectedFeatures.length === 0) {
      const olFeatures = store.layer.ol.getSource().getFeatures();
      moveToOlFeatures(map, olFeatures);
    }
}
