////////////////////////////////////////////////////////////////////////////////
/// DISCLAIMER
///
/// Copyright 2014-2016 ArangoDB GmbH, Cologne, Germany
/// Copyright 2004-2014 triAGENS GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Jan Steemann
////////////////////////////////////////////////////////////////////////////////

#ifndef ARANGOD_MMFILES_MMFILES_INDEX_LOOKUP_CONTEXT_H
#define ARANGOD_MMFILES_MMFILES_INDEX_LOOKUP_CONTEXT_H 1

#include "Basics/Common.h"
#include "VocBase/Identifiers/LocalDocumentId.h"
#include "VocBase/vocbase.h"

namespace arangodb {
class LogicalCollection;
class ManagedDocumentResult;

class MMFilesIndexLookupContext {
 public:
  MMFilesIndexLookupContext() = delete;
  MMFilesIndexLookupContext(LogicalCollection* collection,
                            ManagedDocumentResult* result, size_t numFields);

  ~MMFilesIndexLookupContext() = default;

  uint8_t const* lookup(LocalDocumentId token) const;

  inline size_t numFields() const { return _numFields; }

 private:
  LogicalCollection* _collection;
  mutable ManagedDocumentResult* _result;
  size_t const _numFields;
};

}  // namespace arangodb

#endif
