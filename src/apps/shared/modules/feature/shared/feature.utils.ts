import { EntityRecord } from '@igo2/common';
import {
  Feature,
  FeatureMotion,
  FeatureStore,
  IgoMap,
  moveToOlFeatures
} from '@igo2/geo';

export function moveToFeatureStore(map: IgoMap, store: FeatureStore) {
  const olSource = store.layer.ol.getSource();
  let olFeatures = store.stateView
    .manyBy((record: EntityRecord<Feature>) => record.state.selected === true)
    .map((record: EntityRecord<Feature>) => olSource.getFeatureById(store.getKey(record.entity)));

  if (olFeatures.length === 0) {
    olFeatures = olSource.getFeatures();
  }

  if (olFeatures.length === 0) {
    return;
  }

  moveToOlFeatures(
    map,
    olFeatures,
    FeatureMotion.Zoom,
    [0, 0, 0.8, 0.6]
  );
}
