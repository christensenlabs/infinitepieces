package com.infinitepieces.model

import com.infinitepieces.model.api.v1.ModelV1

interface V1Binding {
  fun toModelV1(): ModelV1
}
